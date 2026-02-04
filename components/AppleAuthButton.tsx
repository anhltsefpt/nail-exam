import * as AppleAuthentication from 'expo-apple-authentication';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface AppleAuthButtonProps {
    style?: StyleProp<ViewStyle>;
}

export function AppleAuthButton({ style }: AppleAuthButtonProps) {
    const { signIn } = useAuth();

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={style}
            onPress={async () => {
                try {
                    const credential = await AppleAuthentication.signInAsync({
                        requestedScopes: [
                            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                            AppleAuthentication.AppleAuthenticationScope.EMAIL,
                        ],
                    });
                    // signed in
                    signIn(credential);
                    console.log(credential);
                } catch (e: any) {
                    if (e.code === 'ERR_CANCELED') {
                        // handle that the user canceled the sign-in flow
                        console.log('User canceled Apple Sign In');
                    } else {
                        // handle other errors
                        console.error('Apple Sign In Error:', e);
                    }
                }
            }}
        />
    );
}
