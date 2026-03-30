import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
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

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const finalizeAndNavigate = async (su: typeof signUp) => {
    await su.finalize({
      navigate: ({ session }) => {
        const task = session.currentTask?.key;
        if (task) {
          router.replace(`/(tabs)`);
        } else {
          router.replace("/(tabs)");
        }
      },
    });
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resending, setResending] = useState(false);
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

  /* ── create sign-up + send email code ── */
  const handleSignUp = async () => {
    if (!validate()) return;
    Keyboard.dismiss();
    setLoading(true);
    setErrors({});

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setErrors({ form: error.longMessage || error.message });
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAndNavigate(signUp);
        return;
      }

      // Email verification needed
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrors({ form: sendError.longMessage || sendError.message });
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      const msg =
        err?.longMessage ||
        err?.message ||
        "Could not create account. Please try again.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── verify the email code ── */
  const handleVerify = async () => {
    if (!code.trim()) {
      setErrors({ code: "Enter the verification code" });
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setErrors({});

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        setErrors({ code: error.longMessage || error.message });
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAndNavigate(signUp);
      } else {
        setErrors({
          code: "Verification incomplete. Please try again.",
        });
      }
    } catch (err: any) {
      const msg =
        err?.longMessage ||
        err?.message ||
        "Invalid verification code";
      setErrors({ code: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── resend code ── */
  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setErrors({});
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setErrors({ code: error.longMessage || error.message });
      }
    } catch (err: any) {
      const msg =
        err?.longMessage ||
        err?.message ||
        "Could not resend code";
      setErrors({ code: msg });
    } finally {
      setResending(false);
    }
  };

  /* ── verification screen ── */
  if (pendingVerification) {
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

                  <Text className="auth-title">Check your email</Text>
                  <Text className="auth-subtitle">
                    We sent a verification code to {email.trim()}
                  </Text>
                </View>

                {/* card */}
                <View className="auth-card">
                  <View className="auth-form">
                    <View className="auth-field">
                      <Text className="auth-label">Verification code</Text>
                      <TextInput
                        className={`auth-input ${errors.code ? "auth-input-error" : ""}`}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        value={code}
                        onChangeText={(t) => {
                          setCode(t);
                          if (errors.code) setErrors((p) => ({ ...p, code: "" }));
                        }}
                        keyboardType="number-pad"
                        autoFocus
                      />
                      {!!errors.code && (
                        <Text className="auth-error">{errors.code}</Text>
                      )}
                    </View>

                    <Pressable
                      className={`auth-button ${loading || !code.trim() ? "auth-button-disabled" : ""}`}
                      onPress={handleVerify}
                      disabled={loading || !code.trim()}
                    >
                      {loading ? (
                        <ActivityIndicator color="#081126" />
                      ) : (
                        <Text className="auth-button-text">Verify email</Text>
                      )}
                    </Pressable>

                    <View className="auth-divider-row">
                      <View className="auth-divider-line" />
                      <Text className="auth-divider-text">or</Text>
                      <View className="auth-divider-line" />
                    </View>

                    <Pressable
                      className={`auth-secondary-button ${resending ? "auth-button-disabled" : ""}`}
                      onPress={handleResend}
                      disabled={resending || loading}
                    >
                      <Text className="auth-secondary-button-text">
                        {resending ? "Sending…" : "Resend code"}
                      </Text>
                    </Pressable>

                    <Pressable
                      className={`auth-secondary-button ${resending ? "auth-button-disabled" : ""}`}
                      onPress={() => {
                        setPendingVerification(false);
                        setCode("");
                        setErrors({});
                      }}
                      disabled={resending || loading}
                    >
                      <Text className="auth-secondary-button-text">
                        Use a different email
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

  /* ── main sign-up form ── */
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

                <Text className="auth-title">Create your account</Text>
                <Text className="auth-subtitle">
                  Start managing all your subscriptions in one place
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
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry
                      autoComplete="new-password"
                      textContentType="newPassword"
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
                    <Text className="auth-helper">
                      Must be at least 8 characters
                    </Text>
                  </View>

                  <Pressable
                    className={`auth-button ${
                      loading || !email.trim() || !password
                        ? "auth-button-disabled"
                        : ""
                    }`}
                    onPress={handleSignUp}
                    disabled={loading || !email.trim() || !password}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Create account</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">
                      Already have an account?
                    </Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <Pressable>
                        <Text className="auth-link">Sign in</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>

              {/* Clerk bot protection */}
              <View nativeID="clerk-captcha" />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}