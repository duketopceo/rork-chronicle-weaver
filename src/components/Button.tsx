/**
 * Custom Button Component for Chronicle Weaver
 * 
 * A flexible, reusable button component designed for the historical RPG theme.
 * Provides multiple variants, sizes, and states to maintain consistent UI/UX
 * across the entire Chronicle Weaver application.
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, outline)
 * - Responsive sizing (small, medium, large)
 * - Loading and disabled states
 * - Platform-specific styling optimizations
 * - Accessibility support
 * - Custom styling overrides
 * 
 * Design Philosophy:
 * - Historical/fantasy theme with elegant styling
 * - Clear visual hierarchy for player decision-making
 * - Consistent touch targets for mobile gameplay
 * - Visual feedback for user interactions
 * 
 * Usage:
 * - Game navigation and menu interactions
 * - Story choice selections
 * - Form submissions and confirmations
 * - Modal and dialog actions
 */

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

/**
 * Button Component Props Interface
 * 
 * Defines all customization options available for the Button component.
 * Provides flexibility while maintaining design consistency.
 */
type ButtonProps = {
  title: string;                                           // Button text display
  onPress: () => void;                                     // Touch handler function
  variant?: "primary" | "secondary" | "outline";          // Visual style variant
  size?: "small" | "medium" | "large";                    // Button size preset
  disabled?: boolean;                                      // Disable user interaction
  loading?: boolean;                                       // Show loading spinner
  style?: ViewStyle;                                       // Custom container styling
  textStyle?: TextStyle;                                   // Custom text styling
};

/**
 * Button Component
 * 
 * Renders a customizable button with platform-optimized styling.
 * Handles different states and provides consistent user experience.
 * 
 * @param props - Button configuration and styling options
 * @returns Styled TouchableOpacity with appropriate visual feedback
 */
export default function Button({
  title,
  onPress,
  variant = "primary",    // Default to primary button style
  size = "medium",        // Default to medium size
  disabled = false,       // Default to enabled state
  loading = false,        // Default to non-loading state
  style,                  // Optional custom styling
  textStyle,              // Optional custom text styling
}: ButtonProps) {
  
  /**
   * Dynamic Button Style Generator
   * 
   * Creates appropriate styling based on variant, size, and state.
   * Handles platform-specific differences for optimal appearance.
   * 
   * @returns Complete ViewStyle object for the button container
   */
  const getButtonStyle = () => {
    // Base styling shared across all button variants
    let baseStyle: ViewStyle = {
      borderRadius: Platform.select({ ios: 16, android: 14, default: 14 }), // Rounded corners
      alignItems: "center",      // Center content horizontally
      justifyContent: "center",  // Center content vertically
      flexDirection: "row",      // Arrange loading indicator and text horizontally
    };
    
    // === VARIANT-SPECIFIC STYLING ===
    
    // Primary Button: Main action button with prominent styling
    if (variant === "primary") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: colors.primary,  // Brand primary color
        // Enhanced shadow for depth and prominence
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: Platform.select({ ios: 6, android: 4, default: 4 }) },
        shadowOpacity: 0.3,
        shadowRadius: Platform.select({ ios: 12, android: 8, default: 8 }),
        elevation: 6,                  // Elevation for Android shadow
      };
    } 
    // Secondary Button: Alternative action with subdued styling
    else if (variant === "secondary") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: colors.secondary,  // Brand secondary color
      };
    } 
    // Outline Button: Transparent background with border
    else if (variant === "outline") {
      baseStyle = {
        ...baseStyle,
        backgroundColor: "transparent",    // No background color
        borderWidth: 2,                   // Border width
        borderColor: colors.primary,      // Border color matches primary
      };
    }
    
    // === SIZE-SPECIFIC STYLING ===
    
    // Small Size: Compact button for tight spaces
    if (size === "small") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 14, android: 12, default: 12 }),  // Vertical padding
        paddingHorizontal: Platform.select({ ios: 28, android: 24, default: 24 }), // Horizontal padding
      };
    } 
    // Medium Size: Default size for general use
    else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 18, android: 16, default: 16 }),
        paddingHorizontal: Platform.select({ ios: 36, android: 32, default: 32 }),
      };
    } 
    // Large Size: Expanded button for emphasis
    else if (size === "large") {
      baseStyle = {
        ...baseStyle,
        paddingVertical: Platform.select({ ios: 22, android: 20, default: 20 }),
        paddingHorizontal: Platform.select({ ios: 44, android: 40, default: 40 }),
      };
    }
    
    // === STATE-BASED STYLING ===
    
    // Disabled State: Indicate non-interactivity
    if (disabled) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.5,                  // Reduced opacity
      };
    }
    
    return baseStyle;
  };
  
  /**
   * Dynamic Text Style Generator
   * 
   * Creates appropriate text styling based on variant and size.
   * Ensures readability and accessibility across button types.
   * 
   * @returns Complete TextStyle object for the button text
   */
  const getTextStyle = () => {
    // Base text styling
    let baseStyle: TextStyle = {
      fontWeight: "600",            // Semi-bold text
      textAlign: "center",          // Center text alignment
    };
    
    // === VARIANT-SPECIFIC TEXT STYLING ===
    
    // Primary Button Text: Contrast with primary background
    if (variant === "primary") {
      baseStyle = {
        ...baseStyle,
        color: colors.background,      // White color for contrast
      };
    } 
    // Secondary Button Text: Contrast with secondary background
    else if (variant === "secondary") {
      baseStyle = {
        ...baseStyle,
        color: colors.text,            // Default text color
      };
    } 
    // Outline Button Text: Match primary color
    else if (variant === "outline") {
      baseStyle = {
        ...baseStyle,
        color: colors.primary,        // Primary color for outline button
      };
    }
    
    // === SIZE-SPECIFIC TEXT STYLING ===
    
    // Small Size Text: Slightly smaller font
    if (size === "small") {
      baseStyle = {
        ...baseStyle,
        fontSize: Platform.select({ ios: 16, android: 15, default: 15 }),
      };
    } 
    // Medium Size Text: Default font size
    else if (size === "medium") {
      baseStyle = {
        ...baseStyle,
        fontSize: Platform.select({ ios: 18, android: 17, default: 17 }),
      };
    } 
    // Large Size Text: Increased font size for emphasis
    else if (size === "large") {
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