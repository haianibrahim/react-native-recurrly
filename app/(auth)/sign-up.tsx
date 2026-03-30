import { Text } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>SignUp</Text>
      <Link href="/(auth)/sign-in">Sign In</Link>
    </SafeAreaView>
  )
}

export default SignUp