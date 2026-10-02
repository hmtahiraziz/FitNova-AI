import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, StackScreenHeader } from '../../components/ui';
import { getLegalDocument } from '../../constants/legal';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';

type AuthProps = NativeStackScreenProps<AuthStackParamList, 'LegalDocument'>;
type RootProps = NativeStackScreenProps<RootStackParamList, 'LegalDocument'>;
type Props = AuthProps | RootProps;

export function LegalDocumentScreen({ navigation, route }: Props) {
  const doc = getLegalDocument(route.params.doc);

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        <StackScreenHeader
          title={doc.title}
          subtitle={`Last updated ${doc.lastUpdated}`}
          onBack={() => navigation.goBack()}
        />
        <Text className="mb-5 font-sans text-sm leading-6 text-slate">
          {doc.intro}
        </Text>
        {doc.sections.map((section) => (
          <View key={section.heading} className="mb-5">
            <Text className="mb-2 font-sans-semibold text-base text-ink">
              {section.heading}
            </Text>
            <Text className="font-sans text-sm leading-6 text-slate">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
