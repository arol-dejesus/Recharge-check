import React from "react";
import { Layout, Select, Space, Typography } from "antd";
import {
  CalendarOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useI18n } from "../i18n/I18nContext";

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

export default function PortalChrome({
  title,
  subtitle,
  actions,
  children,
  footerLabel,
  footerMeta,
}) {
  const { language, setLanguage, languageOptions, t, formatDateTime } = useI18n();
  const resolvedFooterLabel = footerLabel || "Recharge Secure - Verification Center";
  const resolvedFooterMeta = footerMeta || "";

  const nowLabel =
    formatDateTime(new Date(), {
      dateStyle: "medium",
      timeStyle: "short",
    }) || "";

  return (
    <Layout className="rc-shell min-h-screen overflow-x-hidden w-full max-w-[100vw]">
      <div className="rc-meta-strip px-4 sm:px-8">
        <div className="mx-auto max-w-6xl py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Text className="!text-slate-200 text-xs">
            <CustomerServiceOutlined className="mr-1" />
            {t("portal.support")}
          </Text>
          <Text className="!text-slate-300 text-xs">
            <CalendarOutlined className="mr-1" />
            {nowLabel}
          </Text>
        </div>
      </div>

      <Header className="rc-header-shell h-auto px-4 sm:px-8">
        <div className="mx-auto max-w-6xl py-4 flex flex-col gap-4">
          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <div className="rc-brand-row">
                <Text className="rc-brand text-xs uppercase tracking-[0.24em]">{t("common.brand")}</Text>
                <Select
                  size="middle"
                  value={language}
                  onChange={setLanguage}
                  className="rc-lang-select min-w-[140px]"
                  options={languageOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  suffixIcon={<GlobalOutlined />}
                  aria-label={t("common.language")}
                />
              </div>
              <div className="rc-title-row">
                <Title level={4} className="!mb-0 !text-slate-900">
                  {title}
                </Title>
              </div>
              {subtitle ? <Text className="rc-header-subtitle text-slate-500">{subtitle}</Text> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        </div>
      </Header>

      <Content className="px-4 sm:px-8 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6 rc-animate-in">{children}</div>
      </Content>

      <Footer className="rc-footer-shell px-4 sm:px-8 py-6">
        <div className="mx-auto max-w-6xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Text className="!text-slate-200">{resolvedFooterLabel}</Text>
          <Space size={10} wrap>
            <Text className="!text-slate-400 text-xs">{resolvedFooterMeta}</Text>
          </Space>
        </div>
      </Footer>
    </Layout>
  );
}
