import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /* ── client-side validation ── */
  const validate = () => {
    const next: Record<string, string> = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── submit email + password ── */
  const handleSignIn = async () => {
    if (!validate()) return;
    Keyboard.dismiss();
    setLoading(true);
    setErrors({});

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setErrors({ form: error.longMessage || error.message });
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/(tabs)");
      } else if (signIn.status === "needs_second_factor") {
        await signIn.mfa.sendPhoneCode();
        setNeedsMfa(true);
      } else {
        setErrors({ form: "Unable to sign in. Please try again." });
      }
    } catch (err: any) {
      const msg =
        err?.longMessage || err?.message || "Invalid email or password";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── MFA verification ── */
  const handleVerify = async () => {
    if (!code.trim()) {
      setErrors({ code: "Enter the verification code" });
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setErrors({});

    try {
      const { error } = await signIn.mfa.verifyPhoneCode({
        code: code.trim(),
      });

      if (error) {
        setErrors({ code: error.longMessage || error.message });
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/(tabs)");
      } else {
        setErrors({ code: "Verification failed. Try again." });
      }
    } catch (err: any) {
      const msg =
        err?.longMessage || err?.message || "Invalid verification code";
      setErrors({ code: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── MFA screen ── */
  if (needsMfa) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="auth-screen"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className="auth-scroll"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="auth-content">
                {/* brand */}
                <View className="auth-brand-block">
                  <View className="auth-logo-wrap">
                    <View className="auth-logo-mark">
                      <Text className="auth-logo-mark-text">R</Text>
                    </View>
                    <View>
                      <Text className="auth-wordmark">Recurly</Text>
                      <Text className="auth-wordmark-sub">Smart Billing</Text>
                    </View>
                  </View>

                  <Text className="auth-title">Verify your account</Text>
                  <Text className="auth-subtitle">
                    Enter the verification code sent to your device
                  </Text>
                </View>

                {/* card */}
                <View className="auth-card">
                  <View className="auth-form">
                    <View className="auth-field">
                      <Text className="auth-label">Verification code</Text>
                      <TextInput
                        className={`auth-input ${errors.code ? "auth-input-error" : ""}`}
                        placeholder="Enter code"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        autoFocus
                      />
                      {!!errors.code && (
                        <Text className="auth-error">{errors.code}</Text>
                      )}
                    </View>

                    <Pressable
                      className={`auth-button ${loading ? "auth-button-disabled" : ""}`}
                      onPress={handleVerify}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#081126" />
                      ) : (
                        <Text className="auth-button-text">Verify</Text>
                      )}
                    </Pressable>

                    <Pressable
                      className="auth-secondary-button"
                      onPress={() => {
                        setNeedsMfa(false);
                        setCode("");
                        setErrors({});
                      }}
                    >
                      <Text className="auth-secondary-button-text">
                        Start over
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ── main sign-in form ── */
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="auth-content">
              {/* brand */}
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Recurly</Text>
                    <Text className="auth-wordmark-sub">Smart Billing</Text>
                  </View>
                </View>

                <Text className="auth-title">Welcome back</Text>
                <Text className="auth-subtitle">
                  Sign in to continue managing your subscriptions
                </Text>
              </View>

              {/* card */}
              <View className="auth-card">
                <View className="auth-form">
                  {!!errors.form && (
                    <View className="rounded-xl bg-destructive/10 px-4 py-3">
                      <Text className="auth-error">{errors.form}</Text>
                    </View>
                  )}

                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input ${errors.email ? "auth-input-error" : ""}`}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                      }}
                    />
                    {!!errors.email && (
                      <Text className="auth-error">{errors.email}</Text>
                    )}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${errors.password ? "auth-input-error" : ""}`}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry
                      autoComplete="password"
                      textContentType="password"
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (errors.password)
                          setErrors((p) => ({ ...p, password: "" }));
                      }}
                    />
                    {!!errors.password && (
                      <Text className="auth-error">{errors.password}</Text>
                    )}
                  </View>

                  <Pressable
                    className={`auth-button ${
                      loading || !email.trim() || !password
                        ? "auth-button-disabled"
                        : ""
                    }`}
                    onPress={handleSignIn}
                    disabled={loading || !email.trim() || !password}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Sign in</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">New to Recurly?</Text>
                    <Link href="/(auth)/sign-up" asChild>
                      <Pressable>
                        <Text className="auth-link">Create an account</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}