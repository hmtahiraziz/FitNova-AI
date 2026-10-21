import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useDialogStore, type DialogAction } from '../../store/dialogStore';
import { colors, fonts } from '../../theme/tokens';

/**
 * Solid light fills + dark/colored labels (survives Android force-dark).
 * Matches the FitNova confirm card.
 */
function actionStyles(variant: NonNullable<DialogAction['variant']>) {
  switch (variant) {
    case 'primary':
      return {
        bg: colors.mint,
        border: 'transparent',
        text: colors.ink,
      };
    case 'destructive':
      return {
        bg: '#FCE8E8',
        border: 'rgba(196, 22, 28, 0.22)',
        text: '#C4161C',
      };
    case 'option':
      return {
        bg: '#FFFFFF',
        border: 'rgba(11, 31, 26, 0.16)',
        text: colors.ink,
      };
    default:
      return {
        bg: '#E8EAE9',
        border: 'rgba(11, 31, 26, 0.08)',
        text: colors.ink,
      };
  }
}

function ActionButton({
  action,
  onDone,
  stretch,
}: {
  action: DialogAction;
  onDone: () => void;
  /** Equal-width confirm row button */
  stretch?: boolean;
}) {
  const variant = action.variant ?? 'secondary';
  const isOption = variant === 'option';
  const { bg, border, text: textColor } = actionStyles(variant);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        onDone();
        requestAnimationFrame(() => action.onPress?.());
      }}
      style={{ width: '100%' }}>
      {({ pressed }) => (
        <View
          style={{
            minHeight: 40,
            width: '100%',
            justifyContent: 'center',
            alignItems: isOption ? 'flex-start' : 'center',
            borderRadius: 12,
            paddingVertical: isOption ? 10 : 10,
            paddingHorizontal: stretch ? 8 : 12,
            backgroundColor: bg,
            borderWidth: border === 'transparent' ? 0 : 1,
            borderColor: border,
            opacity: pressed ? 0.88 : 1,
          }}>
          <Text
            numberOfLines={isOption ? 3 : 1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: isOption ? 13 : 15,
              lineHeight: 20,
              textAlign: isOption ? 'left' : 'center',
              color: textColor,
              width: '100%',
            }}>
            {action.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function findByLabel(
  actions: DialogAction[],
  match: (label: string) => boolean,
) {
  return actions.find((a) => match(a.label.toLowerCase()));
}

function isConfirmPair(actions: DialogAction[]) {
  if (actions.length !== 2) {
    return false;
  }
  const variants = [
    actions[0].variant ?? 'secondary',
    actions[1].variant ?? 'secondary',
  ];
  return (
    variants.includes('secondary') &&
    (variants.includes('destructive') || variants.includes('primary'))
  );
}

function isPhotoMenu(actions: DialogAction[]) {
  if (actions.length !== 3) {
    return false;
  }
  const labels = actions.map((a) => a.label.toLowerCase());
  return (
    labels.some((l) => l.includes('cancel')) &&
    labels.some((l) => l.includes('change') || l.includes('choose')) &&
    labels.some((l) => l.includes('remove'))
  );
}

function isOptionList(actions: DialogAction[]) {
  const options = actions.filter((a) => (a.variant ?? 'secondary') === 'option');
  const cancel = actions.find((a) => a.label.toLowerCase().includes('cancel'));
  return options.length >= 2 && Boolean(cancel);
}

/** Global FitNova dialog (zustand) — replaces Android Alert. */
export function AppDialogHost() {
  const visible = useDialogStore((s) => s.visible);
  const config = useDialogStore((s) => s.config);
  const hide = useDialogStore((s) => s.hide);
  const { width, height } = useWindowDimensions();
  // Standard phone alert width (~280dp), not a full-bleed card.
  const cardMax = Math.min(width - 80, 280);
  const maxCardHeight = Math.min(height * 0.7, 420);

  const layout = useMemo(() => {
    if (!config) {
      return { kind: 'stack' as const, actions: [] as DialogAction[] };
    }
    const { actions } = config;

    if (isConfirmPair(actions)) {
      const cancel =
        findByLabel(actions, (l) => l.includes('cancel')) ?? actions[0];
      const confirm = actions.find((a) => a !== cancel) ?? actions[1];
      // Cancel left · confirming action right (Material / FitNova)
      return { kind: 'row' as const, actions: [cancel, confirm] };
    }

    if (isPhotoMenu(actions)) {
      const change = findByLabel(
        actions,
        (l) => l.includes('change') || l.includes('choose'),
      )!;
      const remove = findByLabel(actions, (l) => l.includes('remove'))!;
      const cancel = findByLabel(actions, (l) => l.includes('cancel'))!;
      return {
        kind: 'stack' as const,
        actions: [change, remove, cancel],
      };
    }

    if (isOptionList(actions)) {
      const options = actions.filter(
        (a) => (a.variant ?? 'secondary') === 'option',
      );
      const cancel =
        findByLabel(actions, (l) => l.includes('cancel')) ??
        ({ label: 'Cancel', variant: 'secondary' } as DialogAction);
      return { kind: 'options' as const, options, cancel };
    }

    const cancel = findByLabel(actions, (l) => l.includes('cancel'));
    const rest = cancel ? actions.filter((a) => a !== cancel) : actions;
    return {
      kind: 'stack' as const,
      actions: cancel ? [...rest, cancel] : actions,
    };
  }, [config]);

  if (!config) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={hide}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
          onPress={hide}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          style={{
            width: '100%',
            maxWidth: cardMax,
            maxHeight: maxCardHeight,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.16,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 17,
              lineHeight: 22,
              color: colors.ink,
              textAlign: 'center',
            }}>
            {config.title}
          </Text>
          {config.message ? (
            <Text
              style={{
                marginTop: 6,
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 18,
                color: colors.slate,
                textAlign: 'center',
              }}>
              {config.message}
            </Text>
          ) : null}

          {layout.kind === 'row' ? (
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'stretch',
                width: '100%',
              }}>
              {layout.actions.map((action, index) => (
                <View
                  key={action.label}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    marginLeft: index > 0 ? 8 : 0,
                  }}>
                  <ActionButton action={action} onDone={hide} stretch />
                </View>
              ))}
            </View>
          ) : layout.kind === 'options' ? (
            <View style={{ marginTop: 16, flexShrink: 1 }}>
              <ScrollView
                style={{ maxHeight: maxCardHeight - 140 }}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View>
                  {layout.options.map((action, index) => (
                    <View
                      key={action.label}
                      style={{ marginTop: index > 0 ? 8 : 0 }}>
                      <ActionButton action={action} onDone={hide} />
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={{ marginTop: 8 }}>
                <ActionButton action={layout.cancel} onDone={hide} />
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              {layout.actions.map((action, index) => (
                <View
                  key={action.label}
                  style={{ marginTop: index > 0 ? 8 : 0 }}>
                  <ActionButton action={action} onDone={hide} />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
