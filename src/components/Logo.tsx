import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        className={cn(sizeClasses[size])}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Speech bubble body - pale yellow/cream with teal outline */}
        <path
          d="M25 30C25 20 35 15 50 15H70C85 15 95 20 95 30C95 35 90 40 85 42V55L100 60L95 45C100 43 105 38 105 30C105 20 95 15 80 15H50C35 15 25 20 25 30Z"
          fill="#FEF3C7"
          stroke="#14B8A6"
          strokeWidth="4"
        />
        {/* Speech bubble tail */}
        <path
          d="M40 55L45 68L50 55H40Z"
          fill="#FEF3C7"
          stroke="#14B8A6"
          strokeWidth="4"
        />
        {/* Eyes - dark teal */}
        <circle cx="45" cy="40" r="5" fill="#14B8A6" />
        <circle cx="75" cy="40" r="5" fill="#14B8A6" />
        {/* Smile - dark teal */}
        <path
          d="M50 50 Q60 58 70 50"
          stroke="#14B8A6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Blush - light orange-pink */}
        <circle cx="35" cy="45" r="4" fill="#FCA5A5" opacity="0.6" />
        <circle cx="85" cy="45" r="4" fill="#FCA5A5" opacity="0.6" />
        {/* Book - light teal with dark teal outline */}
        <rect
          x="75"
          y="75"
          width="22"
          height="18"
          rx="2"
          fill="#5EEAD4"
          stroke="#14B8A6"
          strokeWidth="2.5"
        />
        {/* Book lines */}
        <line
          x1="80"
          y1="82"
          x2="92"
          y2="82"
          stroke="#14B8A6"
          strokeWidth="2"
        />
        <line
          x1="80"
          y1="86"
          x2="92"
          y2="86"
          stroke="#14B8A6"
          strokeWidth="2"
        />
      </svg>
      {showText && (
        <span className={cn("font-bold gradient-text", textSizeClasses[size])}>Culi</span>
      )}
    </div>
  );
};

export default Logo;

