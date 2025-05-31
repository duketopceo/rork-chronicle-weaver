import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
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
      borderRadius: 16,
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
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
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
    
    // Size styles
    if (size === "small") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: 12,
        paddingHorizontal: 24,
      };
    } else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: 16,
        paddingHorizontal: 32,
      };
    } else if (size === "large") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: 20,
        paddingHorizontal: 40,
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
        fontSize: 15,
      };
    } else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        fontSize: 17,
      };
    } else if (size === "large") {
      baseStyle = {
        ...baseStyle,
        fontSize: 19,
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