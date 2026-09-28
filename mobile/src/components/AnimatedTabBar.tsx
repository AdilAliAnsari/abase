import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    HomeTab: "book",
    Search: "document-text",
    Cart: "sparkles",
    Video: "videocam",
    AI: "sparkles",
};

// Map screen names to readable labels
const LABELS: Record<string, string> = {
    HomeTab: "Book",
    Search: "PDF",
    Cart: "AI",
    Video: "Video",
    AI: "AI",
};

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_MARGIN = 20;
const BAR_WIDTH = SCREEN_W - BAR_MARGIN * 2;

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const tabCount = state.routes.length;

    // We will store the Layout of each tab here
    const layouts = useRef<Record<number, { x: number; width: number }>>({}).current;
    const [layoutsReady, setLayoutsReady] = useState(false);

    // Animated values for indicator position and width
    const indicatorX = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;

    // Scale and label opacity animations for each tab
    const tabAnimations = useRef(
        state.routes.map((_, i) => ({
            activeProgress: new Animated.Value(i === state.index ? 1 : 0),
        }))
    ).current;

    // Handle dynamic measurements
    const onTabLayout = (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        layouts[index] = { x, width };

        // Once we have all tabs measured, trigger layouts ready
        if (Object.keys(layouts).length === tabCount) {
            setLayoutsReady(true);
            // Run initial layout animation
            animateToTab(state.index, false);
        }
    };

    const animateToTab = (index: number, animated = true) => {
        const targetLayout = layouts[index];
        if (!targetLayout) return;

        if (animated) {
            Animated.parallel([
                Animated.spring(indicatorX, {
                    toValue: targetLayout.x,
                    useNativeDriver: false,
                    friction: 8,
                    tension: 80,
                }),
                Animated.spring(indicatorWidth, {
                    toValue: targetLayout.width,
                    useNativeDriver: false,
                    friction: 8,
                    tension: 80,
                }),
            ]).start();
        } else {
            indicatorX.setValue(targetLayout.x);
            indicatorWidth.setValue(targetLayout.width);
        }
    };

    useEffect(() => {
        if (layoutsReady) {
            animateToTab(state.index, true);
        }

        // Trigger tab active state scaling/opacity animations
        tabAnimations.forEach((anim, i) => {
            Animated.spring(anim.activeProgress, {
                toValue: i === state.index ? 1 : 0,
                useNativeDriver: false,
                friction: 8,
                tension: 100,
            }).start();
        });
    }, [state.index, layoutsReady]);

    if (state.routes[state.index]?.name === "AI") {
        return null;
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.bar}>
                {/* Sliding Indicator (Gradient Pill) */}
                {layoutsReady && (
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                left: indicatorX,
                                width: indicatorWidth,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.accentGreenHover, colors.accentGreenDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                )}

                {/* Tab Items */}
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const iconName = ICONS[route.name] ?? "ellipse";
                    const label = LABELS[route.name] ?? route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            onPress={onPress}
                            onLayout={(e) => onTabLayout(index, e)}
                            style={styles.tab}
                            activeOpacity={0.8}
                        >
                            <View style={styles.tabContent}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={iconName} size={22} color={isFocused ? colors.navActiveIcon : colors.navIcon} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    bar: {
        flexDirection: "row",
        width: BAR_WIDTH,
        height: 62,
        borderRadius: 31,
        backgroundColor: colors.navBackground, // Sleek dark slate
        alignItems: "center",
        paddingHorizontal: 8,
        shadowColor: "#000000",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    tabContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingHorizontal: 12,
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 6,
    },
    indicator: {
        position: "absolute",
        height: 46,
        borderRadius: 23,
        overflow: "hidden",
        top: 7,
        left: 0,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});