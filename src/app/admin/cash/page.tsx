"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { addPWANotification } from "@/components/pwa-notifications";

type Cash = {
  id: string;
  nominal: number;
  updated_at: string;
};

const Cash = () => {
  const [cash, setCash] = useState<Cash[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>("");
  const [nominal, setNominal] = useState<number | string>("");
  const [submit, setSubmit] = useState(false);

  const handleUpdateCash = async () => {
    try {
      setSubmit(true);
      const response = await fetch(`/api/cash/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nominal),
      });

      if (!response.ok) {
        throw new Error("Error updating order");
      }

      fetchCash();
      setSubmit(false);

      addPWANotification({
        title: "Cash Updated",
        message: `Cash amount updated to ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(Number(nominal))}`,
        type: "success",
        action: "cash-update",
      });

      alert("Cash updated successfully");
    } catch (error) {
      addPWANotification({
        title: "Cash Update Failed",
        message: `Failed to update cash: ${error}`,
        type: "error",
        action: "cash-update-error",
      });
      alert(error);
      setSubmit(false);
    }
  };

  const fetchCash = async () => {
    try {
      const response = await fetch("/api/cash");
      if (!response.ok) {
        throw new Error("Failed to fetch cash");
      }
      const data = await response.json();
      setCash(data);
      setId(data[0].id);
      setNominal(data[0].nominal);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCash();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2Icon className="mx-auto h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Cash today</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nominal</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cash.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.updated_at).toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell>
                    <Button onClick={handleUpdateCash} disabled={submit}>
                      {submit ? "Processing" : "Update"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cash;
