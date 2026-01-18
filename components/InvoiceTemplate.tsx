import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface InvoiceData {
  invoiceNumber: string;
  title: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  numberOfRooms: number;
  numberOfGuests: number;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  remarks?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#1f2937',
    marginTop: -50,
  },
  invoiceNumber: {
    fontSize: 11,
    textAlign: 'right',
    color: '#6b7280',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    backgroundColor: '#e5e7eb',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    width: '60%',
    color: '#1f2937',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '25%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '25%',
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: '#2563eb',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  remarksSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderLeft: 3,
    borderLeftColor: '#f59e0b',
  },
  remarksTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 10,
    color: '#78350f',
  },
  paidStamp: {
    position: 'absolute',
    top: 120,
    right: 60,
    transform: 'rotate(-15deg)',
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#10b981',
    borderRadius: 8,
    padding: '10 20',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  paidStampText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 4,
  },
});

const InvoiceTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = data.balanceAmount === 0 || (data.advanceAmount && data.advanceAmount >= data.totalAmount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* PAID Stamp - Only show if fully paid */}
        {isPaid && (
          <View style={styles.paidStamp}>
            <Text style={styles.paidStampText}>PAID</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{data.title}</Text>
          <Text style={styles.companyDetails}>Darjeeling, West Bengal, India</Text>
          <Text style={styles.companyDetails}>CIN: U55101WB2024PTC271411</Text>
          <Text style={styles.companyDetails}>Phone: +91-7001137041 | Email: official.hilledge@gmail.com</Text>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>Invoice No: {data.invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>Date: {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        {/* Guest Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Guest Name:</Text>
            <Text style={styles.value}>{data.guestName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Check-in Date:</Text>
            <Text style={styles.value}>{formatDate(data.checkIn)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Check-out Date:</Text>
            <Text style={styles.value}>{formatDate(data.checkOut)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Number of Nights:</Text>
            <Text style={styles.value}>{data.numberOfNights}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Number of Guests:</Text>
            <Text style={styles.value}>{data.numberOfGuests}</Text>
          </View>
        </View>

        {/* Booking Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Rate</Text>
            <Text style={styles.tableCol3}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>
              {data.roomType} ({data.numberOfRooms} room{data.numberOfRooms > 1 ? 's' : ''})
            </Text>
            <Text style={styles.tableCol2}>{formatCurrency(data.pricePerNight)}/night</Text>
            <Text style={styles.tableCol3}>{formatCurrency(data.pricePerNight * data.numberOfNights)}</Text>
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
          {data.advanceAmount !== undefined && data.advanceAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Advance Paid:</Text>
              <Text style={styles.totalValue}>- {formatCurrency(data.advanceAmount)}</Text>
            </View>
          )}
          {data.balanceAmount !== undefined && (
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Balance Due:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(data.balanceAmount)}</Text>
            </View>
          )}
          {(!data.balanceAmount || data.balanceAmount === 0) && (
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Amount:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(data.totalAmount)}</Text>
            </View>
          )}
        </View>

        {/* Remarks */}
        {data.remarks && (
          <View style={styles.remarksSection}>
            <Text style={styles.remarksTitle}>Remarks:</Text>
            <Text style={styles.remarksText}>{data.remarks}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for choosing Pathfinders Nest!</Text>
          <Text style={styles.footerText}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
          <Text style={styles.footerText}>
            For any queries, please contact us at official.hilledge@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
