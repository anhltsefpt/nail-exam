import { useUserStore } from '@/store/useUserStore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Purchases, {
    CustomerInfo,
    PURCHASES_ERROR_CODE,
    PurchasesOffering,
    PurchasesPackage,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'Nail Exam Pro';

/**
 * Maps a RevenueCat PurchasesError to a user-facing alert.
 * Silently returns for user cancellation (no alert needed).
 */
function handlePurchaseError(e: any): void {
    // User cancelled — not an error, no alert
    if (e?.userCancelled || e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return;
    }

    const code: string | undefined = e?.code;

    switch (code) {
        case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
            Alert.alert(
                'Purchase Invalid',
                'This purchase could not be completed. Please check your payment method and try again.',
            );
            break;

        case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
            Alert.alert(
                'Purchase Not Allowed',
                'Purchases are not allowed on this device. Please check your device settings.',
            );
            break;

        case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
            Alert.alert(
                'Product Unavailable',
                'This product is currently not available for purchase in your region.',
            );
            break;

        case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
            Alert.alert(
                'Already Purchased',
                'You already own this product. Try restoring your purchases.',
            );
            break;

        case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
            Alert.alert(
                'Network Error',
                'Please check your internet connection and try again.',
            );
            break;

        case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
            Alert.alert(
                'Store Error',
                'There was a problem connecting to the App Store. Please try again later. You have not been charged.',
            );
            break;

        case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
            Alert.alert(
                'Payment Pending',
                'Your payment is pending approval. You will get access once the payment is confirmed.',
            );
            break;

        case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
            Alert.alert(
                'Receipt In Use',
                'This purchase is already linked to another account. Please restore purchases or contact support.',
            );
            break;

        case PURCHASES_ERROR_CODE.INSUFFICIENT_PERMISSIONS_ERROR:
            Alert.alert(
                'Insufficient Permissions',
                'Your device does not have sufficient permissions to make purchases.',
            );
            break;

        case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
        case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
            Alert.alert(
                'Configuration Error',
                'There is a configuration issue. Please contact support.',
            );
            break;

        default:
            Alert.alert(
                'Purchase Failed',
                'Something went wrong. Please try again later.',
            );
            break;
    }
}

export function useRevenueCat() {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setCurrentOffering(offerings.current);
                }

                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
            } catch (e) {
                console.error('Error fetching RevenueCat data', e);
            } finally {
                setIsReady(true);
            }
        };

        fetchData();

        const customerInfoUpdateListener = (info: CustomerInfo) => {
            setCustomerInfo(info);
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
        };
    }, []);

    useEffect(() => {
        if (customerInfo) {
            const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
            const proValue = entitlement !== undefined;
            setIsPro(proValue);
            // Persist to Zustand so other screens get the cached value instantly
            useUserStore.getState().setIsPro(proValue);
        }
    }, [customerInfo]);

    // --- Purchase a specific package ---
    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            setCustomerInfo(customerInfo);
            return true;
        } catch (e: any) {
            handlePurchaseError(e);
            return false;
        }
    };

    // --- Restore purchases ---
    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            return true;
        } catch (e: any) {
            handlePurchaseError(e);
            return false;
        }
    };

    return {
        currentOffering,
        customerInfo,
        isPro,
        isReady,
        purchasePackage,
        restorePurchases,
    };
}

export { ENTITLEMENT_ID };
