import { Link } from "react-router-dom";
import { Home, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Home className="h-7 w-7" />
          <span>RentHub</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost">Browse</Button>
          </Link>
          <Link to="/add">
            <Button variant="default" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Apartment
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
