"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah, Retail Manager",
    image: "/images/testimonial1.png",
    text: "Using this personal financial system has been a game-changer for me. I can now track my expenses, set budgets, and monitor my financial goals with ease. The intuitive interface makes managing my finances a breeze!",
  },
  {
    id: 2,
    name: "Michael, Small Business Owner",
    image: "/images/testimonial2.png",
    text: "As a small business owner, I was struggling to keep track of my business expenses and personal finances separately. This system has helped me organize everything efficiently and make informed financial decisions.",
  },
  {
    id: 3,
    name: "Jenna, Marketing Coordinator",
    image: "/images/testimonial3.png",
    text: "This personal financial system has been a game-changer for my family's financial well-being. The budgeting tools and expense tracking features have helped us save more and spend wisely.",
  },
]

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
  }

  return (
    <section id="testimonials" className="py-16 px-4 bg-gradient-to-br from-primary/10 to-primary/20">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how MoneyMaster has transformed the financial lives of thousands of users
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* User Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary/80 p-1">
                    <div className="w-full h-full rounded-full bg-white p-2 flex items-center justify-center">
                      <Image
                        src={testimonials[currentIndex].image || "/placeholder.svg"}
                        alt={`${testimonials[currentIndex].name} testimonial`}
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-primary mx-auto md:mx-0" />
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                    "{testimonials[currentIndex].text}"
                  </blockquote>

                  {/* User Info and Rating */}
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-foreground">{testimonials[currentIndex].name}</h4>

                    {/* Star Rating */}
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <Star key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
