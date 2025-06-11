import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform
} from "react-native";
import { colors } from "@/constants/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    let baseStyle: ViewStyle = {
      borderRadius: Platform.select({ ios: 16, android: 14, default: 14 }),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };
    
    // Variant styles
    if (variant === "primary") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: Platform.select({ ios: 6, android: 4, default: 4 }) },
        shadowOpacity: 0.3,
        shadowRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
        elevation: 6,
      };
    } else if (variant === "secondary") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: colors.secondary,
      };
    } else if (variant === "outline") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.primary,
      };
    }
    
    // Size styles with improved mobile spacing
    if (size === "small") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 14, android: 12, default: 12 }),
        paddingHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }),
      };
    } else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 18, android: 16, default: 16 }),
        paddingHorizontal: Platform.select({ ios: 36, android: 32, default: 32 }),
      };
    } else if (size === "large") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 22, android: 20, default: 20 }),
        paddingHorizontal: Platform.select({ ios: 44, android: 40, default: 40 }),
      };
    }
    
    // Disabled style
    if (disabled) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.5,
      };
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    let baseStyle: TextStyle = {
      fontWeight: "600",
      textAlign: "center",
    };
    
    if (variant === "primary") {
      baseStyle = {
        ...baseStyle,
        color: colors.background,
      };
    } else if (variant === "secondary") {
      baseStyle = {
        ...baseStyle,
        color: colors.text,
      };
    } else if (variant === "outline") {
      baseStyle = {
        ...baseStyle,
        color: colors.primary,
      };
    }
    
    if (size === "small") {
      baseStyle = {
        ...baseStyle,
        fontSize: Platform.select({ ios: 16, android: 15, default: 15 }),
      };
    } else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        fontSize: Platform.select({ ios: 18, android: 17, default: 17 }),
      };
    } else if (size === "large") {
      baseStyle = {
        ...baseStyle,
        fontSize: Platform.select({ ios: 20, android: 19, default: 19 }),
      };
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === "outline" ? colors.primary : colors.background} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}