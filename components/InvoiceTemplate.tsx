import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

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
  userPhone?: string;
  userEmail?: string;
  guestPhone?: string;
  guestEmail?: string;
  id?: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  container: {
    padding: 40,
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#0f766e', // Deep Teal
    padding: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    color: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  companyDetails: {
    fontSize: 9,
    opacity: 0.9,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  mainContent: {
    paddingHorizontal: 40,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'normal',
    letterSpacing: 4,
    marginBottom: 10,
    opacity: 0.9,
    textAlign: 'right',
  },
  invoiceMetaItem: {
    fontSize: 10,
    marginBottom: 4,
    opacity: 0.9,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e', // Deep Teal
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: 1,
    borderBottomColor: '#0f766e',
    paddingBottom: 5,
  },
  gridTwoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  col: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    color: '#64748b', // Slate 500
    width: 80,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#334155', // Slate 700
    flex: 1,
  },
  table: {
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9', // Slate 100
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  colDesc: { width: '50%' },
  colRate: { width: '25%', textAlign: 'right' },
  colAmt: { width: '25%', textAlign: 'right' },

  cellText: {
    fontSize: 10,
    color: '#334155',
  },

  summarySection: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '50%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0fdfa', // Teal 50
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e',
  },

  remarksBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fffbeb', // Amber 50
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 9,
    color: '#92400e',
    fontStyle: 'italic',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 2,
  },

  paidStamp: {
    position: 'absolute',
    top: 250,
    right: 80,
    transform: 'rotate(-20deg)',
    borderWidth: 3,
    borderColor: '#10b981', // Emerald 500
    borderRadius: 8,
    padding: '8 20',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  paidText: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
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
        {/* Full width colored header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{data.title}</Text>
            <Text style={styles.companyDetails}>Darjeeling, West Bengal, India</Text>
            <Text style={styles.companyDetails}>CIN: U55101WB2024PTC271411</Text>
            <Text style={styles.companyDetails}>{data.userPhone || '+91-6297395048'} | {data.userEmail || 'official.hilledge@gmail.com'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMetaItem}>#{data.invoiceNumber}</Text>
            <Text style={styles.invoiceMetaItem}>Date: {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* PAID Stamp */}
          {isPaid && (
            <View style={styles.paidStamp}>
              <Text style={styles.paidText}>PAID IN FULL</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.gridTwoColumns}>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Billed To</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>GUEST NAME</Text>
                <Text style={styles.value}>{data.guestName}</Text>
              </View>
              {data.guestPhone && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>PHONE</Text>
                  <Text style={styles.value}>{data.guestPhone}</Text>
                </View>
              )}
              {data.guestEmail && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>EMAIL</Text>
                  <Text style={styles.value}>{data.guestEmail}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>GUESTS</Text>
                <Text style={styles.value}>{data.numberOfGuests} Person(s)</Text>
              </View>
            </View>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Stay Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CHECK-IN</Text>
                <Text style={styles.value}>{formatDate(data.checkIn)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CHECK-OUT</Text>
                <Text style={styles.value}>{formatDate(data.checkOut)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>DURATION</Text>
                <Text style={styles.value}>{data.numberOfNights} Night(s)</Text>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate Details</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmt]}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={{ ...styles.cellText, fontWeight: 'bold' }}>{data.roomType}</Text>
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
                  {data.numberOfRooms} Room(s) × {data.numberOfNights} Night(s)
                </Text>
              </View>
              <Text style={[styles.cellText, styles.colRate]}>
                {formatCurrency(data.pricePerNight)} / night
              </Text>
              <Text style={[styles.cellText, styles.colAmt]}>
                {formatCurrency(data.pricePerNight * data.numberOfRooms * data.numberOfNights)}
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.totalAmount)}</Text>
            </View>

            {data.advanceAmount !== undefined && data.advanceAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advance Paid</Text>
                <Text style={[styles.summaryValue, { color: '#0f766e' }]}>
                  - {formatCurrency(data.advanceAmount)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {(!data.balanceAmount || data.balanceAmount === 0) ? 'Total Amount' : 'Balance Due'}
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency((!data.balanceAmount || data.balanceAmount === 0) ? data.totalAmount : data.balanceAmount)}
              </Text>
            </View>
          </View>

          {/* Remarks */}
          {data.remarks && (
            <View style={styles.remarksBox}>
              <Text style={styles.remarksTitle}>Notes / Remarks</Text>
              <Text style={styles.remarksText}>{data.remarks}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for choosing us for your stay in the mountains!</Text>
          <Text style={styles.footerText}>Secure your next adventure with us.</Text>
          <Text style={styles.footerText}>
            For any queries, please contact us at official.hilledge@gmail.com
          </Text>
          <Text style={{ ...styles.footerText, marginTop: 5, fontSize: 7, marginBottom: 5 }}>
            This is a computer-generated invoice and needs no signature.
          </Text>

          {data.id && (
            <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={styles.footerText}>Verify at: </Text>
              <Link
                src={`https://pathfindersnest.com/api/invoices/${data.id}`}
                style={{ ...styles.footerText, color: '#0f766e', textDecoration: 'underline' }}
              >
                https://pathfindersnest.com/api/invoices/{data.id}
              </Link>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
