import { Text, View, Pressable } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useClerk, useUser } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-6">
        Settings
      </Text>

      {user && (
        <View className="rounded-2xl border border-border bg-card p-4 mb-6">
          <Text className="text-lg font-sans-semibold text-primary">
            {user.firstName
              ? `${user.firstName} ${user.lastName ?? ""}`.trim()
              : "Account"}
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      )}

      <Pressable
        className="items-center rounded-2xl bg-primary py-4"
        onPress={() => signOut()}
      >
        <Text className="font-sans-bold text-background">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;