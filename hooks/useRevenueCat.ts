import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

export function useRevenueCat() {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isPro, setIsPro] = useState(false);

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
            // transform entitlement object to boolean
            // Replace 'pro' with your actual entitlement identifier from RevenueCat dashboard
            const entitlement = customerInfo.entitlements.active['pro'];
            setIsPro(entitlement !== undefined);
        }
    }, [customerInfo]);

    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            setCustomerInfo(customerInfo);
            return true;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Purchase error:', e);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            return true;
        } catch (e) {
            console.error('Restore error:', e);
            return false;
        }
    };

    return { currentOffering, customerInfo, isPro, purchasePackage, restorePurchases };
}
