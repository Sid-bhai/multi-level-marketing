import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiWhatsapp, SiInstagram, SiFacebook, SiGmail } from "react-icons/si";
import Header from "@/components/Header";

export default function Support() {
  return (
    <div>
      <Header showBack={true} />

      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Need help? Contact us through any of these channels:
            </p>

            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open("https://wa.me/919142294671?text=I%20need%20support", "_blank")}
              >
                <SiWhatsapp className="h-5 w-5 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">WhatsApp</span>
                  <span className="text-sm text-muted-foreground">+91 91422 94671</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open("https://instagram.com", "_blank")}
              >
                <SiInstagram className="h-5 w-5 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Instagram</span>
                  <span className="text-sm text-muted-foreground">Follow us for updates</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => window.open("https://facebook.com", "_blank")}
              >
                <SiFacebook className="h-5 w-5 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Facebook</span>
                  <span className="text-sm text-muted-foreground">Connect with us</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => window.location.href = "mailto:support@example.com"}
              >
                <SiGmail className="h-5 w-5 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Email</span>
                  <span className="text-sm text-muted-foreground">support@example.com</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}