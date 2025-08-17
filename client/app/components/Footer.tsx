import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Github,
  Twitter,
  Linkedin,
  Send,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: "hsl(var(--color-primary) / 0.1)" }} className="relative bg-gradient-to-br from-primary/15 to-primary/25 border-t border-border text-foreground bg-grid-pattern">
      <div className="container max-w-full mx-auto px-4 py-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/moneymaster.png"
                width={40}
                height={40}
                alt="Money Master Logo"
                className="rounded-lg"
              />
              <span className="text-xl font-display font-bold text-primary">
                MoneyMaster
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Take control of your finances with our comprehensive money
              management platform. Track expenses, set budgets, and achieve your
              financial goals.
            </p>
            <div className="flex space-x-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Github, label: "GitHub" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-background/20 border-border hover:bg-primary/20 hover:text-primary transition-all"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Navigation</h3>
            <nav className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About Us", href: "/pages/about" },
                { label: "Dashboard", href: "/pages/user" },
                { label: "FAQs", href: "#" },
              ].map(({ label, href }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contact Info</h3>
            <div className="space-y-3">
              {[
                { icon: Phone, text: "+(406) 555-0120" },
                { icon: Phone, text: "+(480) 555-0103" },
                {
                  icon: Mail,
                  text: "support@moneymaster.com",
                  link: "mailto:support@moneymaster.com",
                },
                { icon: MapPin, text: "MoneyMaster Ltd." },
              ].map(({ icon: Icon, text, link }, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {link ? (
                    <a
                      href={link}
                      className="hover:text-primary transition-colors"
                    >
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest financial tips and product updates delivered to
              your inbox.
            </p>
            <Card className="p-4 enhanced-card bg-card/60 backdrop-blur border border-border">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="input-enhanced bg-background/80"
                />
                <Button className="w-full btn-primary text-primary-foreground hover:bg-primary/90">
                  {" "}
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <Separator className="my-8 border-border" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-muted-foreground">
          <div>
            © 2024{" "}
            <Link
              href="/"
              className="font-medium hover:text-primary transition-colors"
            >
              MoneyMaster
            </Link>
            . All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {["Terms & Conditions", "Privacy Policy", "Cookie Policy"].map(
              (item, idx) => (
                <React.Fragment key={idx}>
                  {idx !== 0 && (
                    <Separator
                      orientation="vertical"
                      className="h-4 border-border"
                    />
                  )}
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
