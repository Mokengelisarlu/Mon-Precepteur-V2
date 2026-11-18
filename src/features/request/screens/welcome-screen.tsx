import { ArrowRight, UserPlus } from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { PinInput } from '@/components/ui';
import { normalizeDrcPhoneNumber } from '@/features/client/lib/phone';
import { findClientByPhone } from '@/features/client/services/find-client-by-phone';
import type { ClientProfile } from '@/features/client/types';
import { useTranslation } from '@/hooks/use-translation';
import { hashPin } from '@/lib/crypto/pin';
import { themeColor } from '@/lib/theme';
import { useClientStore } from '@/store/client-store';

import logoSource from '../../../../assets/images/mon-precepteur-logo.png';
import heroSource from '../../../../assets/images/welcome-hero-cutout.png';

const BRAND = themeColor('brand-orange');
const INK = themeColor('on-surface');
const MUTED = themeColor('outline');
const FIELD_BORDER = themeColor('outline-variant');
const PLACEHOLDER = themeColor('outline');
const CREAM = themeColor('surface');
const ERROR = themeColor('error');
const WHITE = themeColor('on-primary');

const PIN_LENGTH = 6;

export interface WelcomeScreenProps {
  readonly onGetStarted: () => void;
  readonly onLoginSuccess?: (client: ClientProfile) => void;
  readonly onLogin?: (phone: string, pin: string) => Promise<boolean>;
}

export function WelcomeScreen({
  onGetStarted,
  onLoginSuccess,
  onLogin,
}: WelcomeScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const clients = useClientStore((state) => state.clients);
  const isCompact = windowWidth <= 360;
  const heroWidth = Math.min(windowWidth * (isCompact ? 0.56 : 0.62), 330);
  const heroHeight = heroWidth / (700 / 491);
  const heroCopyWidth = isCompact ? '58%' : '52%';
  const headlineFontSize = isCompact ? 20 : 22;
  const headlineLineHeight = isCompact ? 25 : 27;

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [pinError, setPinError] = useState<string | undefined>();
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError !== undefined) setPhoneError(undefined);
    if (loginError !== undefined) setLoginError(undefined);
  };

  const handlePinChange = (val: string) => {
    setPin(val);
    if (pinError !== undefined) setPinError(undefined);
    if (loginError !== undefined) setLoginError(undefined);
  };

  const handleSubmit = async () => {
    setPhoneError(undefined);
    setPinError(undefined);
    setLoginError(undefined);

    const normalized = normalizeDrcPhoneNumber(phone);
    if (normalized === null) {
      setPhoneError(t('validation.contact.phone'));
      return;
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPinError(t('validation.pin.format'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (onLogin !== undefined) {
        const ok = await onLogin(normalized, pin);
        if (!ok) {
          setLoginError(t('welcome.loginFailed'));
        }
        return;
      }

      const client = findClientByPhone(clients, normalized);
      if (client === undefined) {
        setLoginError(t('welcome.loginFailed'));
        return;
      }

      const hashed = await hashPin(pin, client.pinSalt);
      if (hashed !== client.pinHash) {
        setLoginError(t('welcome.loginFailed'));
        return;
      }

      onLoginSuccess?.(client);
    } catch {
      setLoginError(t('welcome.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: CREAM }} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        testID="welcome-scroll"
      >
        {/* ───────── Orange header ───────── */}
        <View
          style={{
            backgroundColor: BRAND,
            paddingTop: insets.top + 16,
            paddingBottom: 52,
            paddingHorizontal: 20,
            overflow: 'hidden',
          }}
          testID="welcome-hero"
        >
          {/* Tutor illustration, anchored to the wave at the bottom-right */}
          <Image
            source={heroSource}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            style={{
              position: 'absolute',
              right: -4,
              bottom: 8,
              width: heroWidth,
              height: heroHeight,
            }}
          />

          <View className="flex-row items-center gap-s">
            <Image
              source={logoSource}
              resizeMode="contain"
              accessibilityLabel={t('common.appName')}
              style={{ width: 44, height: 39, tintColor: WHITE }}
            />
            <Text style={{ color: WHITE, fontSize: 16, fontWeight: '700' }}>
              {t('common.appName')}
            </Text>
          </View>

          <View style={{ width: heroCopyWidth, marginTop: 18 }}>
            <Text
              accessibilityRole="header"
              style={{
                color: WHITE,
                fontSize: headlineFontSize,
                lineHeight: headlineLineHeight,
                fontWeight: '800',
              }}
            >
              {t('welcome.headline')}
            </Text>

            <Text
              style={{
                color: WHITE,
                fontSize: 12.5,
                lineHeight: 17,
                marginTop: 12,
                maxWidth: 150,
                opacity: 0.95,
              }}
            >
              {t('welcome.proposition')}
            </Text>
          </View>

          {/* Wavy top edge of the white sheet */}
          <Svg
            width="120%"
            height={40}
            viewBox="0 0 390 40"
            preserveAspectRatio="none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}
          >
            <Path
              d="M0 22 C90 2 170 0 240 12 C300 22 350 34 390 20 L390 40 L0 40 Z"
              fill={WHITE}
            />
          </Svg>
        </View>

        {/* ───────── Form sheet ───────── */}
        <View
          style={{ backgroundColor: WHITE, paddingHorizontal: 24, paddingTop: 14 }}
          testID="welcome-connection-form"
        >
          {/* Phone */}
          <View className="flex-row items-center gap-2">
            <Text style={{ color: INK, fontSize: 13, fontWeight: '600' }}>
              {t('welcome.phoneLabel')}
            </Text>
          </View>
          <View
            className="mt-2 flex-row items-center"
            style={{
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: phoneError !== undefined ? ERROR : FIELD_BORDER,
              backgroundColor: WHITE,
              paddingHorizontal: 14,
              gap: 12,
            }}
          >
            <Text style={{ color: INK, fontSize: 15, fontWeight: '600' }}>+243</Text>
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder={t('welcome.phonePlaceholder')}
              placeholderTextColor={PLACEHOLDER}
              keyboardType="phone-pad"
              autoComplete="tel"
              selectionColor={BRAND}
              accessibilityLabel={t('welcome.phoneLabel')}
              style={{ flex: 1, fontSize: 15, color: INK, padding: 0 }}
              testID="welcome-phone-input"
            />
          </View>
          {phoneError !== undefined ? (
            <Text
              accessibilityRole="alert"
              className="mt-1 text-body-small text-error"
              testID="welcome-phone-input-error"
            >
              {phoneError}
            </Text>
          ) : null}

          {/* PIN */}
          <View className="mt-5 flex-row items-center gap-2">
            <Text style={{ color: INK, fontSize: 13, fontWeight: '600' }}>
              {t('welcome.pinLabel')}
            </Text>
          </View>
          <View className="mt-2">
            <PinInput
              value={pin}
              onChange={handlePinChange}
              secure
              invalid={pinError !== undefined}
              length={PIN_LENGTH}
              accessibilityLabel={t('welcome.pinLabel')}
              testID="welcome-pin-input"
            />
          </View>
          {pinError !== undefined ? (
            <Text
              accessibilityRole="alert"
              className="mt-1 text-body-small text-error"
              testID="welcome-pin-input-error"
            >
              {pinError}
            </Text>
          ) : null}

          {loginError !== undefined ? (
            <Text
              accessibilityRole="alert"
              className="mt-3 text-center text-body-small text-error"
              testID="welcome-login-error"
            >
              {loginError}
            </Text>
          ) : null}

          {/* Primary button */}
          <Pressable
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            className="flex-row items-center justify-center active:opacity-90"
            style={{
              marginTop: 24,
              height: 46,
              borderRadius: 12,
              backgroundColor: BRAND,
              gap: 8,
              shadowColor: BRAND,
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
            testID="welcome-login-submit"
          >
            {isSubmitting ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <>
                <Text style={{ color: WHITE, fontSize: 15, fontWeight: '700' }}>
                  {t('welcome.submitLogin')}
                </Text>
                <ArrowRight size={18} color={WHITE} strokeWidth={2.2} />
              </>
            )}
          </Pressable>

          {/* Secondary button */}
          <Pressable
            onPress={onGetStarted}
            accessibilityRole="button"
            className="flex-row items-center justify-center active:opacity-80"
            style={{
              marginTop: 14,
              height: 46,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: BRAND,
              backgroundColor: WHITE,
              gap: 8,
            }}
            testID="welcome-get-started"
          >
            <UserPlus size={20} color={BRAND} strokeWidth={2} />
            <Text style={{ color: BRAND, fontSize: 15, fontWeight: '700' }}>
              {t('welcome.cta')}
            </Text>
          </Pressable>
        </View>

        {/* Credit line */}
        <View
          style={{
            backgroundColor: WHITE,
            padding: 36,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: MUTED, fontSize: 12.5, fontWeight: '400' }}>
            Powerd by Mokengeli Sarlu
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
