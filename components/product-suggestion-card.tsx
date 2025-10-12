import { ShoppingCart, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductSuggestionCard() {
  const products = [
    {
      name: "Impact Whey Protein",
      brand: "MYPROTEIN",
      rating: 4.8,
      price: "$29.99",
      image: "/protein-powder.png",
    },
    {
      name: "Creatine Monohydrate",
      brand: "MYPROTEIN",
      rating: 4.9,
      price: "$19.99",
      image: "/creatine-supplement.jpg",
    },
  ]

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">Recommended for You</h3>
          <p className="text-sm text-muted-foreground">Based on your workout plan</p>
        </div>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
          view all
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <div key={index} className="bg-secondary/30 rounded-lg p-3">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-16 object-cover rounded-md mb-2"
            />
            <p className="text-xs font-medium text-accent mb-1">{product.brand}</p>
            <p className="text-sm font-medium text-foreground text-balance leading-tight mb-2">{product.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{product.rating}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{product.price}</span>
            </div>
            <Button size="sm" className="w-full mt-2 h-7 text-xs">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
