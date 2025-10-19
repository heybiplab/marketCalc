"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Item {
  id: string;
  name: string;
  details: string;
  price: number;
}

type BaseUnit = "kg" | "litre" | "quintal" | "dozen";
type MeasuredUnit = "gram" | "kg" | "ml" | "litre" | "piece";

interface Currency {
  code: string;
  symbol: string;
  flag: string;
  name: string;
}

const currencies: Currency[] = [
  { code: "INR", symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "PKR", symbol: "₨", flag: "🇵🇰", name: "Pakistani Rupee" },
];

const unitDivisors: Record<BaseUnit, number> = {
  kg: 1000,
  litre: 1000,
  quintal: 100000,
  dozen: 12,
};

const measuredUnitOptions: Record<BaseUnit, MeasuredUnit[]> = {
  kg: ["gram", "kg"],
  litre: ["ml", "litre"],
  quintal: ["gram", "kg"],
  dozen: ["piece"],
};

export default function MarketCalculator() {
  const [isDark, setIsDark] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0]
  );
  const [items, setItems] = useState<Item[]>([]);
  const [weighedDialogOpen, setWeighedDialogOpen] = useState(false);
  const [mrpDialogOpen, setMrpDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Weighed item form state
  const [weighedForm, setWeighedForm] = useState({
    itemName: "",
    basePrice: "",
    baseUnit: "kg" as BaseUnit,
    quantity: "",
    measuredUnit: "gram" as MeasuredUnit,
  });

  // MRP item form state
  const [mrpForm, setMrpForm] = useState({
    itemName: "",
    price: "",
  });

  // Load theme and currency from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      const currency = currencies.find((c) => c.code === savedCurrency);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem("currency", currencyCode);
    }
  };

  // Calculate weighed item price
  const calculateWeighedPrice = (
    basePrice: number,
    quantity: number,
    baseUnit: BaseUnit,
    measuredUnit: MeasuredUnit
  ): number => {
    const divisor = unitDivisors[baseUnit];
    const quantityInBaseUnit =
      measuredUnit === "gram" || measuredUnit === "ml"
        ? quantity / divisor
        : quantity;
    return (basePrice / divisor) * (quantityInBaseUnit * divisor);
  };

  // Add weighed item
  const handleAddWeighedItem = () => {
    const basePrice = Number.parseFloat(weighedForm.basePrice);
    const quantity = Number.parseFloat(weighedForm.quantity);

    if (!basePrice || !quantity) return;

    const divisor = unitDivisors[weighedForm.baseUnit];
    let quantityInBaseUnit = quantity;

    if (weighedForm.measuredUnit === "gram") {
      quantityInBaseUnit = quantity / 1000;
    } else if (weighedForm.measuredUnit === "ml") {
      quantityInBaseUnit = quantity / 1000;
    } else if (weighedForm.measuredUnit === "piece") {
      quantityInBaseUnit = quantity / 12;
    }

    const calculatedPrice =
      (basePrice / divisor) * (quantityInBaseUnit * divisor);

    const newItem: Item = {
      id: Date.now().toString(),
      name: weighedForm.itemName || "Item",
      details: `${quantity}${weighedForm.measuredUnit} @ ${selectedCurrency.symbol}${basePrice}/${weighedForm.baseUnit}`,
      price: calculatedPrice,
    };

    setItems([...items, newItem]);
    setWeighedForm({
      itemName: "",
      basePrice: "",
      baseUnit: "kg",
      quantity: "",
      measuredUnit: "gram",
    });
    setWeighedDialogOpen(false);
  };

  // Add MRP item
  const handleAddMrpItem = () => {
    const price = Number.parseFloat(mrpForm.price);

    if (!mrpForm.itemName || !price) return;

    const newItem: Item = {
      id: Date.now().toString(),
      name: mrpForm.itemName,
      details: "MRP",
      price: price,
    };

    setItems([...items, newItem]);
    setMrpForm({ itemName: "", price: "" });
    setMrpDialogOpen(false);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Reset bill
  const handleResetBill = () => {
    setItems([]);
    setResetDialogOpen(false);
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // Get available measured units based on base unit
  const availableMeasuredUnits = measuredUnitOptions[weighedForm.baseUnit];

  // Check if weighed form is valid
  const isWeighedFormValid = weighedForm.basePrice && weighedForm.quantity;

  // Check if MRP form is valid
  const isMrpFormValid = mrpForm.itemName && mrpForm.price;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            {/* Header with theme toggle and currency selector */}
            <CardHeader className="relative pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold">
                    MarketCalc
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Easily calculate prices for weighed and fixed-rate items.
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-start">
                  <Select
                    value={selectedCurrency.code}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Toggle theme"
                  >
                    {isDark ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Total Amount Display */}
              <div className="bg-muted p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Amount
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{selectedCurrency.flag}</span>
                  <p className="text-5xl font-bold font-mono">
                    {selectedCurrency.symbol}
                    {total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => setWeighedDialogOpen(true)}
                  className="w-full"
                  variant="default"
                >
                  Add Weighed Item
                </Button>
                <Button
                  onClick={() => setMrpDialogOpen(true)}
                  className="w-full"
                  variant="secondary"
                >
                  Add MRP Item
                </Button>
                <Button
                  onClick={() => setResetDialogOpen(true)}
                  className="w-full"
                  variant="destructive"
                >
                  Reset Bill
                </Button>
              </div>

              {/* Items List */}
              <div>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Your cart is empty. Add an item to get started!
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="w-10">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {item.details}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {selectedCurrency.symbol}
                              {item.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                aria-label="Delete item"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weighed Item Dialog */}
      <Dialog open={weighedDialogOpen} onOpenChange={setWeighedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Calculate & Add Item</DialogTitle>
            <DialogDescription>
              Enter the item details to calculate the price.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Item Name (Optional)
              </label>
              <Input
                placeholder="e.g., Tomatoes"
                value={weighedForm.itemName}
                onChange={(e) =>
                  setWeighedForm({ ...weighedForm, itemName: e.target.value })
                }
              />
            </div>

            {/* Base Price */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Base Price
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="100"
                    value={weighedForm.basePrice}
                    onChange={(e) =>
                      setWeighedForm({
                        ...weighedForm,
                        basePrice: e.target.value,
                      })
                    }
                  />
                </div>
                <span className="text-sm text-muted-foreground px-2">
                  {selectedCurrency.symbol} per
                </span>
                <Select
                  value={weighedForm.baseUnit}
                  onValueChange={(value) => {
                    setWeighedForm({
                      ...weighedForm,
                      baseUnit: value as BaseUnit,
                      measuredUnit: measuredUnitOptions[value as BaseUnit][0],
                    });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="litre">litre</SelectItem>
                    <SelectItem value="quintal">quintal</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Measured Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Measured Quantity
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="400"
                    value={weighedForm.quantity}
                    onChange={(e) =>
                      setWeighedForm({
                        ...weighedForm,
                        quantity: e.target.value,
                      })
                    }
                  />
                </div>
                <Select
                  value={weighedForm.measuredUnit}
                  onValueChange={(value) => {
                    setWeighedForm({
                      ...weighedForm,
                      measuredUnit: value as MeasuredUnit,
                    });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMeasuredUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Real-time Preview */}
            {isWeighedFormValid && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  Calculated Price
                </p>
                <p className="text-2xl font-bold font-mono">
                  {selectedCurrency.symbol}
                  {calculateWeighedPrice(
                    Number.parseFloat(weighedForm.basePrice),
                    Number.parseFloat(weighedForm.quantity),
                    weighedForm.baseUnit,
                    weighedForm.measuredUnit
                  ).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWeighedDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWeighedItem}
              disabled={!isWeighedFormValid}
            >
              Add to Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MRP Item Dialog */}
      <Dialog open={mrpDialogOpen} onOpenChange={setMrpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fixed Price Item</DialogTitle>
            <DialogDescription>
              Enter the item name and its fixed price.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Item Name
              </label>
              <Input
                placeholder="e.g., Bread"
                value={mrpForm.itemName}
                onChange={(e) =>
                  setMrpForm({ ...mrpForm, itemName: e.target.value })
                }
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Price (MRP)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={mrpForm.price}
                onChange={(e) =>
                  setMrpForm({ ...mrpForm, price: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMrpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMrpItem} disabled={!isMrpFormValid}>
              Add to Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all items and reset the total to zero. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResetBill}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
