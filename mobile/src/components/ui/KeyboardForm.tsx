import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  UIManager,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputFocusEventData,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;

type KeyboardFormContextValue = {
  /**
   * Pass TextInput onFocus event. Scrolls only enough to keep that field
   * above the keyboard — never jumps to the bottom of long screens.
   */
  scrollFocusedIntoView: (event?: FocusEvent) => void;
  keyboardOpen: boolean;
};

const KeyboardFormContext = createContext<KeyboardFormContextValue>({
  scrollFocusedIntoView: () => {},
  keyboardOpen: false,
});

export function useKeyboardForm(): KeyboardFormContextValue {
  return useContext(KeyboardFormContext);
}

type KeyboardFormProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  className?: string;
  /** Base bottom padding (tab bar / footer breathing room). */
  bottomExtra?: number;
  /** Extra gap above the keyboard when lifting a field (px). */
  focusLift?: number;
};

function resolveTargetHandle(event?: FocusEvent): number | null {
  if (!event) {
    return null;
  }
  const raw = event.target as unknown;
  if (typeof raw === 'number') {
    return raw;
  }
  return findNodeHandle(raw as Parameters<typeof findNodeHandle>[0]);
}

/**
 * Keyboard-safe form shell: avoids the keyboard and scrolls only the
 * focused field into view (staples, notes, delete confirm, etc.).
 */
export function KeyboardForm({
  children,
  contentContainerStyle,
  className = 'flex-1',
  bottomExtra = 16,
  focusLift = 28,
}: KeyboardFormProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const pendingFocusHandle = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const liftFocusedHandle = useCallback(
    (handle: number | null) => {
      if (handle == null || !scrollRef.current) {
        return;
      }

      UIManager.measure(
        handle,
        (_x, _y, _w, height, _pageX, pageY) => {
          const kb = keyboardHeightRef.current;
          const windowH = Dimensions.get('window').height;
          const visibleBottom = windowH - Math.max(kb, 0) - focusLift;
          const fieldBottom = pageY + height;

          if (fieldBottom <= visibleBottom) {
            return;
          }

          const delta = fieldBottom - visibleBottom + 8;
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollYRef.current + delta),
            animated: true,
          });
        },
      );
    },
    [focusLift],
  );

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      const h = e.endCoordinates.height;
      keyboardHeightRef.current = h;
      setKeyboardHeight(h);
      // Keyboard height often arrives after onFocus — lift pending field then.
      if (pendingFocusHandle.current != null) {
        requestAnimationFrame(() => {
          liftFocusedHandle(pendingFocusHandle.current);
        });
      }
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      pendingFocusHandle.current = null;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [liftFocusedHandle]);

  const scrollFocusedIntoView = useCallback(
    (event?: FocusEvent) => {
      const handle = resolveTargetHandle(event);
      pendingFocusHandle.current = handle;

      const delay = Platform.OS === 'ios' ? 100 : 160;
      setTimeout(() => {
        liftFocusedHandle(handle);
      }, delay);
    },
    [liftFocusedHandle],
  );

  const ctx = useMemo(
    () => ({
      scrollFocusedIntoView,
      keyboardOpen: keyboardHeight > 0,
    }),
    [scrollFocusedIntoView, keyboardHeight],
  );

  // Extra scroll room under the focused field (notes / multiline) while the keyboard is up.
  const keyboardTail =
    keyboardHeight > 0
      ? Platform.OS === 'ios'
        ? focusLift + 24
        : Math.max(focusLift + 24, Math.round(keyboardHeight * 0.2))
      : 0;

  return (
    <KeyboardAvoidingView
      className={className}
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
        contentContainerStyle={[
          { paddingBottom: bottomExtra + keyboardTail, flexGrow: 1 },
          contentContainerStyle,
        ]}>
        <KeyboardFormContext.Provider value={ctx}>
          {children}
        </KeyboardFormContext.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
