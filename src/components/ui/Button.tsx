/**
 * BUTTON COMPONENT - Chronicle Weaver v2.0
 * 
 * Purpose: Reusable button component with multiple variants and states
 * Features:
 * - Multiple visual variants (primary, secondary, outline, ghost)
 * - Different sizes (small, medium, large)
 * - Loading state with spinner
 * - Disabled state handling
 * - Icon support (leading and trailing)
 * - Accessibility features (screen reader support)
 * - Touch feedback and animations
 * 
 * Usage Examples:
 * <Button variant="primary" size="large" onPress={handleSubmit}>
 *   Submit
 * </Button>
 * 
 * <Button variant="outline" loading={isLoading} disabled={!isValid}>
 *   Save Game
 * </Button>
 * 
 * <Button variant="ghost" size="sm" icon={<Icon name="settings" />}>
 *   Settings
 * </Button>
 * 
 * Dependencies:
 * - React Native Pressable for touch handling
 * - Tailwind classes via NativeWind
 * - Optional icon component
 * - Loading spinner component
 */

import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { cn } from '@/utils/classNames';
import type { PressableProps } from 'react-native';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Button variant styles
 */
export type ButtonVariant = 
  | 'primary'      // Solid background, primary color
  | 'secondary'    // Solid background, secondary color
  | 'outline'      // Transparent background, colored border
  | 'ghost'        // Transparent background, no border
  | 'destructive'; // Red/warning color for dangerous actions

/**
 * Button size presets
 */
export type ButtonSize = 
  | 'sm'      // Small: compact padding, smaller text
  | 'md'      // Medium: standard size (default)
  | 'lg'      // Large: expanded padding, larger text
  | 'xl';     // Extra large: maximum padding and text

/**
 * Button component props
 */
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button content - text or React elements */
  children: React.ReactNode;
  
  /** Visual variant of the button */
  variant?: ButtonVariant;
  
  /** Size preset for the button */
  size?: ButtonSize;
  
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  
  /** Disable button interaction */
  disabled?: boolean;
  
  /** Icon to show before the text */
  iconLeft?: React.ReactNode;
  
  /** Icon to show after the text */
  iconRight?: React.ReactNode;
  
  /** Make button full width */
  fullWidth?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Test identifier for automated testing */
  testID?: string;
}

// ============================================================================
// STYLE CONFIGURATIONS
// ============================================================================

/**
 * Base styles applied to all buttons
 */
const baseStyles = [
  'flex-row',           // Horizontal layout for icon + text
  'items-center',       // Vertically center content
  'justify-center',     // Horizontally center content
  'rounded-lg',         // Rounded corners
  'border',             // Border for outline variants
  'transition-all',     // Smooth transitions
  'duration-200',       // Animation duration
].join(' ');

/**
 * Variant-specific styles
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-amber-600',       // Primary background color
    'border-amber-600',   // Matching border
    'active:bg-amber-700', // Pressed state
  ].join(' '),
  
  secondary: [
    'bg-gray-600',        // Secondary background
    'border-gray-600',    // Matching border
    'active:bg-gray-700', // Pressed state
  ].join(' '),
  
  outline: [
    'bg-transparent',     // Transparent background
    'border-amber-600',   // Colored border
    'active:bg-amber-50', // Light background on press
  ].join(' '),
  
  ghost: [
    'bg-transparent',     // Transparent background
    'border-transparent', // No visible border
    'active:bg-gray-100', // Light background on press
  ].join(' '),
  
  destructive: [
    'bg-red-600',         // Warning/danger color
    'border-red-600',     // Matching border
    'active:bg-red-700',  // Pressed state
  ].join(' '),
};

/**
 * Size-specific styles
 */
const sizeStyles: Record<ButtonSize, { container: string; text: string; icon: string }> = {
  sm: {
    container: 'px-3 py-2 min-h-[32px]',
    text: 'text-sm font-medium',
    icon: 'w-4 h-4',
  },
  md: {
    container: 'px-4 py-3 min-h-[44px]',
    text: 'text-base font-semibold',
    icon: 'w-5 h-5',
  },
  lg: {
    container: 'px-6 py-4 min-h-[52px]',
    text: 'text-lg font-semibold',
    icon: 'w-6 h-6',
  },
  xl: {
    container: 'px-8 py-5 min-h-[60px]',
    text: 'text-xl font-bold',
    icon: 'w-7 h-7',
  },
};

/**
 * Text color styles based on variant
 */
const textColorStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-amber-600',
  ghost: 'text-gray-700',
  destructive: 'text-white',
};

/**
 * Disabled state styles
 */
const disabledStyles = [
  'opacity-50',         // Reduced opacity
  'cursor-not-allowed', // Not-allowed cursor (web)
].join(' ');

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports icons, loading states, and full accessibility features.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  accessibilityLabel,
  testID,
  onPress,
  ...pressableProps
}: ButtonProps) {
  
  // Determine if button should be interactive
  const isInteractive = !disabled && !loading;
  
  // Build complete className
  const buttonClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size].container,
    fullWidth && 'w-full',
    (disabled || loading) && disabledStyles,
    className
  );
  
  // Build text className
  const textClassName = cn(
    sizeStyles[size].text,
    textColorStyles[variant]
  );
  
  // Build icon className
  const iconClassName = cn(
    sizeStyles[size].icon,
    textColorStyles[variant]
  );
  
  // Handle press events
  const handlePress = (event: any) => {
    if (isInteractive && onPress) {
      onPress(event);
    }
  };
  
  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityState={{
        disabled: disabled || loading,
      }}
      testID={testID}
      className={buttonClassName}
    >
      {({ pressed }) => (
        <View className="flex-row items-center justify-center">
          {/* Loading Spinner */}
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={variant === 'outline' || variant === 'ghost' ? '#d97706' : '#ffffff'}
              className="mr-2"
            />
          )}
          
          {/* Left Icon */}
          {iconLeft && !loading && (
            <View className={cn(iconClassName, 'mr-2')}>
              {iconLeft}
            </View>
          )}
          
          {/* Button Text */}
          <Text className={textClassName}>
            {children}
          </Text>
          
          {/* Right Icon */}
          {iconRight && !loading && (
            <View className={cn(iconClassName, 'ml-2')}>
              {iconRight}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// COMPONENT VARIANTS AND SHORTCUTS
// ============================================================================

/**
 * Primary button shortcut
 */
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

/**
 * Secondary button shortcut
 */
export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

/**
 * Outline button shortcut
 */
export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="outline" />;
}

/**
 * Ghost button shortcut
 */
export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ghost" />;
}

/**
 * Destructive button shortcut for dangerous actions
 */
export function DestructiveButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="destructive" />;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Button;