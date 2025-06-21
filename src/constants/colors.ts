/**
 * Color Palette for Chronicle Weaver
 * 
 * A carefully crafted color system inspired by ancient manuscripts, medieval libraries,
 * and illuminated texts. This palette creates an immersive historical atmosphere
 * while maintaining modern accessibility standards and visual hierarchy.
 * 
 * Design Philosophy:
 * - Evokes the atmosphere of candlelit libraries and ancient texts
 * - Uses warm, earthy tones reminiscent of parchment and aged materials
 * - Provides sufficient contrast for readability and accessibility
 * - Creates visual hierarchy for game mechanics and narrative elements
 * 
 * Color Categories:
 * - Base Colors: Background and surface elements
 * - Brand Colors: Primary and secondary theme colors
 * - Semantic Colors: Success, error, warning states
 * - Narrative Colors: Story-specific UI elements
 * - System Colors: Game mechanic categorization
 * 
 * Historical Inspiration:
 * - Illuminated manuscript gold leaf
 * - Aged parchment and vellum textures
 * - Leather book bindings and clasps
 * - Medieval ink and pigment colors
 * - Candlelight and oil lamp illumination
 */

export const colors = {
  // === BASE COLORS ===
  // Foundation colors inspired by ancient manuscript materials
  
  // Sophisticated manuscript theme inspired by ancient libraries and illuminated texts
  background: "#0F0D0A",    // Deep parchment brown - aged manuscript pages in candlelight
  surface: "#1C1611",       // Rich leather binding brown with atmospheric depth
  surfaceLight: "#2A221A",  // Lighter manuscript brown with warm undertones
  
  // === PRIMARY BRAND COLORS ===
  // Illuminated manuscript gold and amber with enhanced richness
  
  primary: "#E8B86D",       // Warm manuscript gold - like illuminated letters catching light
  primaryLight: "#F2D4A7",  // Light parchment gold with subtle luminosity
  primaryDark: "#C49C5A",   // Deep manuscript amber with earthy sophistication
  
  // === SECONDARY BRAND COLORS ===
  // Deep forest green inspired by ancient book bindings
  
  secondary: "#3A4D3A",     // Deep sage green - traditional book cloth color
  secondaryLight: "#5B6E5B", // Medium sage green with natural sophistication
  
  // === ACCENT COLORS ===
  // Royal burgundy for highlighting important interface elements
  
  accent: "#7A4A6A",        // Deep burgundy - reminiscent of royal seals and important markings
  accentLight: "#9A6A8A",   // Light burgundy with regal elegance
  
  // === TEXT COLORS ===
  // Warm ivory and sepia tones like aged ink with optimal contrast
  
  text: "#F8F5E8",          // Warm ivory - primary text resembling fresh ink on parchment
  textSecondary: "#E8DDD0", // Warm beige - secondary text like naturally aged ink
  textMuted: "#D4C5B0",     // Muted tan - subtle text like very old, faded ink
  
  // === SEMANTIC COLORS ===
  // System feedback colors with rich, manuscript-inspired tones
  
  success: "#4D6C4D",       // Deep forest green - representing growth and positive outcomes
  error: "#9A4A42",         // Deep rust red - like dried blood or urgent red ink warnings
  warning: "#D4A56B",       // Warm amber - like candlelight flickering in warning
  
  // === UI FRAMEWORK COLORS ===
  // Interface structural elements with sophisticated manuscript depth
  
  border: "#3A2D1F",        // Warm dark border - reminiscent of manuscript margins
  borderLight: "#4D3F31",   // Medium warm border with subtle depth variation
  
  // === NARRATIVE ELEMENT COLORS ===
  // Special colors for story-specific UI components with literary inspiration
  
  narrativeBackground: "#141106", // Slightly warm reading background for story text
  choiceBackground: "#1A140B",   // Warm choice background with inviting depth
  memoryAccent: "#7A6AAE",       // Deep lavender purple - like pressed flowers in old books
  loreAccent: "#5A8A8A",         // Deep sage blue-green - ancient knowledge and wisdom
  
  // === GAME SYSTEM COLORS ===
  // Thematic colors for different game mechanics with historical inspiration
  
  politicsAccent: "#8A5A7A",     // Deep royal purple - nobility, court intrigue, power
  economicsAccent: "#E8B86D",    // Rich gold - commerce, trade, wealth accumulation
  warAccent: "#9A4A42",          // Deep red - conflict, warfare, military actions
  relationshipAccent: "#D4A56B", // Warm amber - interpersonal connections and social bonds
  inventoryAccent: "#7A6A5A",    // Warm brown - physical possessions and material goods
  
  // === INTERACTIVE ELEMENT COLORS ===
  // Additional sophisticated UI elements for enhanced user interaction
  
  scrollAccent: "#C49C5A",       // Manuscript gold - interactive scroll and parchment elements
  crownAccent: "#F2D4A7",        // Bright gold - royal status and important achievements
  parchmentAccent: "#F8F5E8",    // Ivory - highlights and emphasis elements
  
  // Enhanced manuscript accent colors
  wisdomAccent: "#5A7AAE", // Deeper scholarly blue for wisdom and learning
  mysteryAccent: "#7A5A8A", // Deeper purple for mysteries and secrets
  heroicAccent: "#9A4A42", // Noble red for heroic moments
  tragicAccent: "#4D4D4D", // Muted gray for tragic elements
  
  // Reading comfort colors - Enhanced for mobile readability
  readingBackground: "#0C0A08", // Optimized for long text reading with deeper warmth
  highlightBackground: "#1F1A10", // Subtle highlight for important text
  selectionBackground: "#2F241C", // Text selection background with warmth
  
  // Mobile-optimized colors for better touch interaction
  touchHighlight: "#E8B86D" + "40", // Primary color with transparency for touch feedback
  activeBackground: "#1C1611", // Active state background
  focusedBorder: "#F2D4A7", // Focused input border color
  
  // Enhanced contrast colors for better mobile accessibility
  highContrastText: "#FFFFFF", // Pure white for maximum contrast when needed
  mediumContrastText: "#F8F5E8", // Ivory for medium contrast
  lowContrastText: "#E8DDD0", // Warm beige for low contrast elements
  
  // Debug and development colors with enhanced visibility
  debugBackground: "#1A0F0A", // Darker brown for debug panels
  debugBorder: "#3A2D1F", // Warm border for debug elements
  debugSuccess: "#4D6C4D", // Green for success states
  debugError: "#9A4A42", // Red for error states
  debugWarning: "#D4A56B", // Amber for warning states
  debugInfo: "#5A7AAE", // Blue for info states
  
  // Enhanced spacing and layout colors for better mobile UX
  cardBackground: "#1C1611", // Card background with subtle warmth
  cardBorder: "#2A221A", // Card border for definition
  divider: "#3A2D1F", // Divider lines between sections
  overlay: "#0F0D0A" + "CC", // Semi-transparent overlay for modals
  
  // Interactive element colors optimized for touch
  buttonPrimary: "#E8B86D", // Primary button color
  buttonSecondary: "#3A4D3A", // Secondary button color
  buttonDisabled: "#4D3F31", // Disabled button color
  inputBackground: "#2A221A", // Input field background
  inputBorder: "#4D3F31", // Input field border
  inputFocused: "#E8B86D", // Focused input border
  
  // Status and feedback colors
  statusOnline: "#4D6C4D", // Online/connected status
  statusOffline: "#9A4A42", // Offline/disconnected status
  statusPending: "#D4A56B", // Pending/loading status
  statusIdle: "#7A6A5A", // Idle status
  
  // Platform-specific adjustments
  iosShadow: "#000000" + "40", // iOS shadow color
  androidElevation: "#000000" + "30", // Android elevation shadow
  webFocus: "#E8B86D" + "60", // Web focus outline
};

export default colors;