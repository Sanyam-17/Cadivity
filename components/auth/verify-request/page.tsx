import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequest() {
  return (
    <Card>
       <CardHeader>
        <CardTitle>Please check your email</CardTitle>
         <CardDescription>
          We've sent a verification code to your email address.
         </CardDescription>
       </CardHeader>
    </Card>
  )
}