"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth,API_URL } from "@/utils/auth_fn";
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useReactToPrint  } from 'react-to-print';


export default function VendorBills() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [shouldDownload, setShouldDownload] = useState(false);

  useEffect(() => {
  const fetchBills = async () => {
    const token = localStorage.getItem('access_token');
    const companyId = localStorage.getItem('company_id');
    if (!token || !companyId) return;
    const res = await fetchWithAuth(`${API_URL}/invoices/?company=${companyId}`);
    if (res.ok) {
      const data = await res.json();
      setBills(Array.isArray(data) ? data : (data.results || []));
    }
  };
  fetchBills();
}, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: selectedBill ? selectedBill.invoice_number : 'Invoice',
  }as any);

  const handleDownload = () => {
    if (!selectedBill) return;
    const element = printRef.current;
    if (!element) return;
    const html = element.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBill.invoice_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    if (shouldPrint && showModal && printRef.current) {
      handlePrint?.();
      setShouldPrint(false);
    }
  }, [shouldPrint, showModal]);

  useEffect(() => {
    if (shouldDownload && showModal && printRef.current) {
      handleDownload();
      setShouldDownload(false);
    }
  }, [shouldDownload, showModal]);

  const openBill = (bill: any) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBill(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/manufacturer/accounting')}
        className="mb-6"
      >
        <FileText className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="bg-[#1E293B] border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-blue-400">Vendor Bills</CardTitle>
          <Button 
            onClick={() => router.push('/manufacturer/accounting/createBill')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Bill
          </Button>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-blue-400 text-sm">
                    <th className="text-left p-2">Invoice No</th>
                    <th className="text-left p-2">Retailer</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.invoice_number} className="text-white border-t border-blue-500/20">
                      <td className="p-2">{bill.invoice_number}</td>
                      <td className="p-2">{bill.Retailer?.name || bill.retailer_name || bill.Retailer}</td>
                      <td className="p-2 text-right">{bill.grand_total}</td>
                      <td className="p-2">{new Date(bill.invoice_date).toLocaleDateString()}</td>
                      <td className="p-2">{bill.payment_status}</td>
                      <td className="p-2 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openBill(bill)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => {openBill(bill);setShouldPrint(true);}}>Print</Button>
                        <Button variant="outline" size="sm" onClick={() => { openBill(bill); setTimeout(handleDownload, 200); setShouldDownload(true);}}>Download</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-white p-8">
              No bills found. Click "New Bill" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Preview Modal */}
{showModal && selectedBill && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-[#0F172A] rounded-lg p-8 max-w-3xl w-full relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={closeModal}
      >
        ×
      </button>
      <div ref={printRef} className="text-white p-6 space-y-6">
        {/* Company and Invoice Heading */}
        <div className="flex justify-between mb-6">
          <div>
            <div className="text-xl font-bold">{selectedBill.company?.name || "Company Name"}</div>
            <div className="text-sm">{selectedBill.company?.address || "Company Address"}</div>
            <div className="text-sm">{selectedBill.company?.city && <>City: {selectedBill.company.city}</>}</div>
            <div className="text-sm">{selectedBill.company?.state && <>State: {selectedBill.company.state}</>}</div>
            <div className="text-sm">{selectedBill.company?.country && <>Country: {selectedBill.company.country}</>}</div>
            <div className="text-sm">{selectedBill.company?.pincode && <>Pincode: {selectedBill.company.pincode}</>}</div>
            <div className="text-sm">{selectedBill.company?.gstin && <>GSTIN: {selectedBill.company.gstin}</>}</div>
            <div className="text-sm">{selectedBill.company?.email && <>Email: {selectedBill.company.email}</>}</div>
            <div className="text-sm">{selectedBill.company?.phone && <>Phone: {selectedBill.company.phone}</>}</div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="text-3xl font-bold text-blue-400 mb-2">INVOICE</div>
          </div>
        </div>
        {/* Retailer and Invoice Details Side by Side */}
        <div className="flex justify-between mb-4 gap-8">
          <div>
            <div className="font-semibold">Billed To:</div>
            <div>{selectedBill.Retailer?.name || selectedBill.Retailer || "Retailer Name"}</div>
            <div className="text-sm">{selectedBill.Retailer?.address_line1}</div>
            <div className="text-sm">{selectedBill.Retailer?.address_line2}</div>
            <div className="text-sm">{selectedBill.Retailer?.city && <>City: {selectedBill.Retailer.city}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.pincode && <>Pincode: {selectedBill.Retailer.pincode}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.state && <>State: {selectedBill.Retailer.state}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.country && <>Country: {selectedBill.Retailer.country}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.gstin && <>GSTIN: {selectedBill.Retailer.gstin}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.email && <>Email: {selectedBill.Retailer.email}</>}</div>
            <div className="text-sm">{selectedBill.Retailer?.contact && <>Contact: {selectedBill.Retailer.contact}</>}</div>
          </div>
          <div className="space-y-1 text-right self-start">
            <div><span className="font-semibold">Invoice No:</span> {selectedBill.invoice_number}</div>
            <div><span className="font-semibold">Date:</span> {selectedBill.invoice_date ? new Date(selectedBill.invoice_date).toLocaleString() : 'Not specified'}</div>
            <div><span className="font-semibold">Payment Mode:</span> {selectedBill.payment_mode}</div>
            <div><span className="font-semibold">Payment Status:</span> {selectedBill.payment_status}</div>
          </div>
        </div>
        {/* Products Table */}
        <table className="w-full text-sm text-white mb-2 border border-blue-800 rounded">
          <thead>
            <tr className="bg-blue-900">
              <th className="p-2">#</th>
              <th className="p-2">Product</th>
              <th className="p-2">HSN</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Taxable</th>
              <th className="p-2">GST %</th>
              <th className="p-2">CGST</th>
              <th className="p-2">SGST</th>
              <th className="p-2">IGST</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedBill.items?.map((item: any, idx: number) => (
              <tr key={idx} className="bg-[#0F172A] border-b border-blue-800">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{item.name || item.Product_name || ""}</td>
                <td className="p-2">{item.hsn_code}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.price?.toFixed ? item.price.toFixed(2) : item.price}</td>
                <td className="p-2">{item.taxable_value?.toFixed ? item.taxable_value.toFixed(2) : item.taxable_value}</td>
                <td className="p-2">{item.gst_rate}</td>
                <td className="p-2">{item.cgst?.toFixed ? item.cgst.toFixed(2) : item.cgst}</td>
                <td className="p-2">{item.sgst?.toFixed ? item.sgst.toFixed(2) : item.sgst}</td>
                <td className="p-2">{item.igst?.toFixed ? item.igst.toFixed(2) : item.igst}</td>
                <td className="p-2">
                  {item.taxable_value && item.cgst && item.sgst && item.igst
                    ? (
                        (Number(item.taxable_value) + Number(item.cgst) + Number(item.sgst) + Number(item.igst)).toFixed(2)
                      )
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Totals - Aligned Left */}
        <div className="flex flex-col gap-2 mt-4 max-w-md w-full">
          <div className="flex justify-between w-full">
            <span className="font-semibold text-left">Total Taxable Value:</span>
            <span className="text-right">{selectedBill.total_taxable_value?.toFixed ? selectedBill.total_taxable_value.toFixed(2) : selectedBill.total_taxable_value}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="font-semibold text-left">Total CGST:</span>
            <span className="text-right">{selectedBill.total_cgst?.toFixed ? selectedBill.total_cgst.toFixed(2) : selectedBill.total_cgst}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="font-semibold text-left">Total SGST:</span>
            <span className="text-right">{selectedBill.total_sgst?.toFixed ? selectedBill.total_sgst.toFixed(2) : selectedBill.total_sgst}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="font-semibold text-left">Total IGST:</span>
            <span className="text-right">{selectedBill.total_igst?.toFixed ? selectedBill.total_igst.toFixed(2) : selectedBill.total_igst}</span>
          </div>
          <div className="flex justify-between w-full text-lg font-bold mt-2 border-t border-blue-800 pt-2">
            <span className="text-left">Grand Total:</span>
            <span className="text-right">{selectedBill.grand_total?.toFixed ? selectedBill.grand_total.toFixed(2) : selectedBill.grand_total}</span>
          </div>
        </div>
        {/* Note and Signature */}
        <div className="flex justify-between items-end mt-8">
          <div>
            <div className="font-semibold">Note:</div>
            <div className="text-sm text-gray-300">Thank you for your business!</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">Authorized Signature</div>
            <div className="w-40 h-12 border-b border-gray-400 mx-0"></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handlePrint}>Print</Button>
        <Button onClick={handleDownload}>Download</Button>
        <Button variant="outline" onClick={closeModal}>Close</Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}