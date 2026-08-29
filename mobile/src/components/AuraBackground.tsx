import React from 'react';
import { View, Platform } from 'react-native';

export const AuraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return (
      <div className="aura-bg">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { background-color: #000000 !important; }
              .aura-bg {
                position: relative;
                min-height: 100vh;
                background-color: #000000;
              }
            `,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1, zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};
