import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_user_id';
let cachedId: string | null = null;

/** Generate a UUID v4 using Math.random */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Get or create a persistent user ID for this installation */
export async function getUserId(): Promise<string> {
    if (cachedId) return cachedId;
    let id = await AsyncStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = generateUUID();
        await AsyncStorage.setItem(STORAGE_KEY, id);
    }
    cachedId = id;
    return id;
}
