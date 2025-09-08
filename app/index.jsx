import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Animated } from 'react-native';

const HOME_URL = 'http://192.168.43.247:8000/api';

const Home = () => {
  const [addressInput, setAddressInput] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [xrpPrice, setXrpPrice] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Fetch XRP price on component mount
  useEffect(() => {
    fetchXRPPrice();
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchXRPPrice = async () => {
    try {
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
      const priceData = await priceResponse.json();
      setXrpPrice(priceData.ripple.usd);
    } catch (error) {
      console.log('Failed to fetch XRP price:', error);
      setXrpPrice(0.50); // Fallback price
    }
  };

  const handleExplore = async () => {
    // Clear previous state
    setWalletData(null);
    setError('');
    setLoading(true);

    try {
      console.log('Making request to:', `${HOME_URL}/explore`);
      console.log('Request body:', JSON.stringify({ address: addressInput }));

      const response = await fetch(`${HOME_URL}/explore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ address: addressInput }),
      });

      console.log('Response status:', response.status);

      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        setError('Server returned invalid JSON response');
        return;
      }

      if (response.ok) {
        setWalletData(data);
      } else {
        setError(data.message || 'An unknown error occurred.');
      }
    } catch (e) {
      setError('Failed to connect to the server or invalid address format.');
      console.error('Full error:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionType = (type) => {
    // Make transaction types more human-readable
    switch (type) {
      case 'Payment':
        return 'Payment';
      case 'AccountSet':
        return 'Account Update';
      case 'TrustSet':
        return 'Trustline Set';
      default:
        return type || 'Unknown';
    }
  };

  const renderTransactionAmount = (tx) => {
    if (!tx || !tx.tx || !tx.tx.Amount) return null;
    
    if (typeof tx.tx.Amount === 'string') {
      const amount = parseFloat(tx.tx.Amount) / 1000000;
      return (
        <Text style={styles.txText}>
          <Text style={styles.txLabel}>Amount:</Text> 
          <Text style={styles.amountValue}> {amount.toFixed(6)} XRP</Text>
        </Text>
      );
    }
    return null;
  };

  const renderTransactionFee = (tx) => {
    if (!tx || !tx.tx || !tx.tx.Fee) return 'N/A';
    return (parseFloat(tx.tx.Fee) / 1000000).toFixed(6);
  };

  const formatCurrency = (amount, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.titleContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.xIcon}>
                <Text style={styles.xIconText}>✕</Text>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.brandName}>XRPL</Text>
                <View style={styles.brandSeparator} />
                <Text style={styles.brandSuffix}>W</Text>
              </View>
            </View>
            <View style={styles.glowEffect} />
          </View>
          <Text style={styles.headerSubtitle}>
            Explore XRP wallets • Track balances • View transactions
          </Text>
          
          {/* XRP Price Display */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceTitle}>XRP Price</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>LIVE</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>
                ${xrpPrice ? formatCurrency(xrpPrice, 4) : '0.0000'}
              </Text>
              <Text style={styles.priceSubtext}>USD</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Wallet</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setAddressInput}
              value={addressInput}
              placeholder="Enter XRP address (r...)"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.exploreButton, (!addressInput || loading) && styles.exploreButtonDisabled]}
              onPress={handleExplore}
              disabled={loading || !addressInput}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.exploreButtonText}>Explore</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {walletData && (
          <Animated.View style={[styles.dataContainer, { opacity: fadeAnim }]}>
            <View style={styles.walletCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Wallet Overview</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>ACTIVE</Text>
                </View>
              </View>
              
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Address</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {walletData.address || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>XRP Balance</Text>
                  <Text style={styles.balanceValue}>
                    {walletData.balanceXRP ? formatCurrency(parseFloat(walletData.balanceXRP), 6) : '0.000000'}
                  </Text>
                  <Text style={styles.balanceUnit}>XRP</Text>
                </View>
                
                <View style={styles.balanceDivider} />
                
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>USD Value</Text>
                  <Text style={styles.usdValue}>
                    ${walletData.usdValue ? formatCurrency(parseFloat(walletData.usdValue), 2) : '0.00'}
                  </Text>
                  <Text style={styles.balanceUnit}>USD</Text>
                </View>
              </View>
            </View>

            <View style={styles.transactionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
                <Text style={styles.txCount}>
                  {walletData.transactions ? walletData.transactions.length : 0} txns
                </Text>
              </View>
              
              {walletData.transactions && walletData.transactions.length > 0 ? (
                <View style={styles.transactionList}>
                  {walletData.transactions.map((tx, index) => (
                    <View key={index} style={styles.transactionItem}>
                      <View style={styles.txHeader}>
                        <View style={styles.txTypeContainer}>
                          <View style={styles.txTypeIcon}>
                            <Text style={styles.txTypeIconText}>
                              {formatTransactionType(tx?.tx?.TransactionType).charAt(0)}
                            </Text>
                          </View>
                          <Text style={styles.txType}>
                            {formatTransactionType(tx?.tx?.TransactionType)}
                          </Text>
                        </View>
                        <View style={[styles.statusIndicator, 
                          tx?.meta?.TransactionResult === 'tesSUCCESS' ? styles.statusSuccess : styles.statusFailed
                        ]}>
                          <Text style={styles.statusText}>
                            {tx?.meta?.TransactionResult === 'tesSUCCESS' ? 'SUCCESS' : 'FAILED'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.txDetails}>
                        {renderTransactionAmount(tx)}
                        <Text style={styles.txText}>
                          <Text style={styles.txLabel}>Fee:</Text> 
                          <Text style={styles.feeValue}> {renderTransactionFee(tx)} XRP</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noTransactions}>
                  <Text style={styles.noTransactionsIcon}>📋</Text>
                  <Text style={styles.noTransactionsText}>No recent transactions found</Text>
                  <Text style={styles.noTransactionsSubtext}>Transactions will appear here once available</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b14',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  titleContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  xIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  xIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3b82f6',
    textShadowColor: '#3b82f6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  titleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.2,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  brandSeparator: {
    width: 3,
    height: 28,
    backgroundColor: '#10b981',
    marginHorizontal: 8,
    borderRadius: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  brandSuffix: {
    fontSize: 38,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: -1.2,
    textShadowColor: '#10b981',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -20,
    right: -20,
    bottom: -10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    zIndex: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceCard: {
    backgroundColor: '#1a1b23',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2d2e36',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  priceBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: -0.5,
  },
  priceSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  searchSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: '#1a1b23',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2d2e36',
  },
  exploreButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  exploreButtonDisabled: {
    backgroundColor: '#374151',
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  dataContainer: {
    gap: 20,
  },
  walletCard: {
    backgroundColor: '#1a1b23',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d2e36',
  },
  transactionCard: {
    backgroundColor: '#1a1b23',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d2e36',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  statusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  txCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#2d2e36',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#60a5fa',
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#2d2e36',
    marginHorizontal: 20,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  usdValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f59e0b',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  balanceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#0f1419',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2e36',
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  txTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txTypeIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txTypeIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  txType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: '#059669',
  },
  statusFailed: {
    backgroundColor: '#dc2626',
  },
  txDetails: {
    gap: 8,
  },
  txText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  txLabel: {
    fontWeight: '600',
    color: '#9ca3af',
  },
  amountValue: {
    fontWeight: '700',
    color: '#10b981',
  },
  feeValue: {
    fontWeight: '600',
    color: '#f59e0b',
  },
  noTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTransactionsIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  noTransactionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  noTransactionsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default Home;