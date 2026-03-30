import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-border">
    <Text className="text-sm font-sans-medium text-muted-foreground">{label}</Text>
    <Text className="text-sm font-sans-semibold text-primary shrink-1 text-right ml-4" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Account";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-sans-bold text-primary mb-6">
          Settings
        </Text>

        {user && (
          <>
            {/* Profile card */}
            <View className="items-center rounded-2xl border border-border bg-card p-6 mb-4">
              <Image
                source={{ uri: user.imageUrl }}
                className="w-20 h-20 rounded-full mb-3"
              />
              <Text className="text-lg font-sans-bold text-primary">
                {displayName}
              </Text>
              {user.username && (
                <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">
                  @{user.username}
                </Text>
              )}
              <Text className="text-sm font-sans-medium text-accent mt-1">
                {user.primaryEmailAddress?.emailAddress}
              </Text>
            </View>

            {/* Account details */}
            <View className="rounded-2xl border border-border bg-card px-4 mb-4">
              <Text className="text-xs font-sans-bold text-muted-foreground uppercase tracking-wider pt-4 pb-1">
                Account
              </Text>
              <InfoRow label="User ID" value={user.id} />
              <InfoRow
                label="Member since"
                value={dayjs(user.createdAt).format("MMM D, YYYY")}
              />
              {user.primaryPhoneNumber && (
                <InfoRow label="Phone" value={user.primaryPhoneNumber.phoneNumber} />
              )}
              <InfoRow
                label="Two-factor"
                value={user.twoFactorEnabled ? "Enabled" : "Disabled"}
              />
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">Last sign in</Text>
                <Text className="text-sm font-sans-semibold text-primary">
                  {user.lastSignInAt
                    ? dayjs(user.lastSignInAt).format("MMM D, YYYY h:mm A")
                    : "—"}
                </Text>
              </View>
            </View>
          </>
        )}

        <Pressable
          className="items-center rounded-2xl bg-primary py-4"
          onPress={() => signOut()}
        >
          <Text className="font-sans-bold text-background">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;