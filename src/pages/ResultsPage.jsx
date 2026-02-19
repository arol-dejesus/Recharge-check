import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  FilterOutlined,
  SearchOutlined,
  SyncOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PortalChrome from "../components/PortalChrome";
import { useI18n } from "../i18n/I18nContext";
import { readRechargeHistory, writeRechargeHistory } from "../utils/rechargeHistory";

const { Text } = Typography;
const { Option } = Select;

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (["pending", "en attente", "in attesa", "pendiente"].includes(value)) {
    return "pending";
  }
  return "verified";
};

export default function ResultsPage() {
  const [rechargeData, setRechargeData] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();
  const { t, formatDateTime } = useI18n();

  useEffect(() => {
    setRechargeData(readRechargeHistory());
  }, []);

  const getTypeLabel = useCallback((type) => {
    const key = `recharge.types.${type}`;
    const translated = t(key);
    return translated === key ? type : translated;
  }, [t]);

  const formatDate = useCallback((value) => {
    return (
      formatDateTime(value, {
        dateStyle: "medium",
        timeStyle: "short",
      }) || t("results.dateUnavailable")
    );
  }, [formatDateTime, t]);

  const typeOptions = useMemo(() => {
    const unique = Array.from(new Set(rechargeData.map((entry) => entry.rechargeType).filter(Boolean)));
    return ["all", ...unique];
  }, [rechargeData]);

  const filteredData = useMemo(() => {
    return rechargeData.filter((entry) => {
      const matchesType = selectedType === "all" || entry.rechargeType === selectedType;
      if (!matchesType) return false;

      const statusKey = normalizeStatus(entry.status);
      const matchesStatus = selectedStatus === "all" || statusKey === selectedStatus;
      if (!matchesStatus) return false;

      const needle = searchValue.trim().toLowerCase();
      if (!needle) return true;

      const statusLabel = t(`status.${statusKey}`).toLowerCase();
      const haystack = [
        entry.id,
        getTypeLabel(entry.rechargeType),
        entry.amount,
        statusLabel,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(needle);
    });
  }, [rechargeData, searchValue, selectedType, selectedStatus, t, getTypeLabel]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      const amount = Number(item.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [filteredData]);

  const successRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const successCount = filteredData.filter((item) => normalizeStatus(item.status) === "verified").length;
    return Math.round((successCount / filteredData.length) * 100);
  }, [filteredData]);

  const latestEntryLabel = useMemo(() => {
    if (filteredData.length === 0) return t("results.messages.noVerification");
    return formatDate(filteredData[0].createdAt || filteredData[0].timestamp);
  }, [filteredData, formatDate, t]);

  const handleDelete = (index) => {
    const entry = filteredData[index];
    const next = rechargeData.filter((item) => item !== entry);
    writeRechargeHistory(next);
    setRechargeData(next);
    message.success(t("results.messages.deleted"));
  };

  const handleClearAll = () => {
    writeRechargeHistory([]);
    setRechargeData([]);
    message.success(t("results.messages.cleared"));
  };

  const handleCopyCodes = (codes = []) => {
    navigator.clipboard.writeText(codes.join("\n")).then(() => {
      message.success(t("results.messages.copied"));
    });
  };

  return (
    <PortalChrome
      title={t("results.title")}
      subtitle={t("results.subtitle")}
      actions={
        <>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} className="!rounded-xl">
            {t("results.backToVerification")}
          </Button>
          <Popconfirm
            title={t("results.clearTitle")}
            description={t("results.clearDescription")}
            onConfirm={handleClearAll}
            okText={t("results.clearOk")}
            cancelText={t("results.clearCancel")}
            disabled={rechargeData.length === 0}
          >
            <Button danger className="!rounded-xl" disabled={rechargeData.length === 0}>
              {t("results.clear")}
            </Button>
          </Popconfirm>
        </>
      }
      footerLabel={t("results.footerLabel")}
      footerMeta={t("results.footerMeta")}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-1 !rounded-2xl !border-0">
            <Statistic title={t("results.kpi.verifications")} value={filteredData.length} prefix={<FileSearchOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-2 !rounded-2xl !border-0">
            <Statistic title={t("results.kpi.totalAmount")} value={totalAmount.toFixed(2)} suffix="EUR" prefix={<WalletOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-3 !rounded-2xl !border-0">
            <Statistic title={t("results.kpi.complianceRate")} value={successRate} suffix="%" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card className="rc-elevated-card rc-lift rc-delay-2 !rounded-2xl !border-slate-200/80">
        <Space className="w-full !justify-between" wrap>
          <Text className="text-slate-600 text-sm">
            <SyncOutlined className="mr-2 text-[#ff3366]" />
            {t("results.latestVisible", { date: latestEntryLabel })}
          </Text>
          <Tag color="magenta">{t("results.secureJournalTag")}</Tag>
        </Space>
      </Card>

      <Card className="rc-elevated-card rc-lift rc-delay-3 !rounded-2xl !border-slate-200/80">
        <Row gutter={[14, 14]}>
          <Col xs={24} md={11}>
            <Input
              size="large"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder={t("results.filters.searchPlaceholder")}
              className="!rounded-xl"
            />
          </Col>
          <Col xs={24} md={7}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              size="large"
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              {typeOptions.map((type) => (
                <Option key={type} value={type}>
                  {type === "all" ? t("results.filters.allTypes") : getTypeLabel(type)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select value={selectedStatus} onChange={setSelectedStatus} size="large" className="w-full">
              <Option value="all">{t("results.filters.allStatuses")}</Option>
              <Option value="verified">{t("results.statusFilters.verified")}</Option>
              <Option value="pending">{t("results.statusFilters.pending")}</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Alert
        type="success"
        showIcon
        message={t("results.alert.title")}
        description={t("results.alert.description")}
      />

      <Card className="rc-elevated-card rc-lift rc-delay-4 !rounded-2xl !border-slate-200/80" title={t("results.audit.title")}>
        {filteredData.length === 0 ? (
          <Empty description={t("results.audit.empty")} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => navigate("/")} className="!rounded-xl !bg-[#ff3366] !border-[#ff3366]">
              {t("results.audit.start")}
            </Button>
          </Empty>
        ) : (
          <List
            className="rc-list-animate"
            itemLayout="vertical"
            dataSource={filteredData}
            split={false}
            renderItem={(item, index) => (
              <List.Item key={`${item.id || "entry"}-${index}`} className="!px-0 !py-2">
                <Card className="rc-log-item rc-lift !rounded-xl !border-slate-200/80" hoverable>
                  <Space direction="vertical" size={10} className="w-full">
                    <Row gutter={[12, 8]}>
                      <Col xs={24} md={10}>
                        <Text className="text-slate-500 text-xs uppercase">{t("results.audit.reference")}</Text>
                        <Text className="block rc-mono text-slate-900">{item.id || t("common.notAvailable")}</Text>
                      </Col>
                      <Col xs={12} md={5}>
                        <Text className="text-slate-500 text-xs uppercase">{t("results.audit.type")}</Text>
                        <Text className="block text-slate-900">{getTypeLabel(item.rechargeType) || t("common.notAvailable")}</Text>
                      </Col>
                      <Col xs={12} md={5}>
                        <Text className="text-slate-500 text-xs uppercase">{t("results.audit.amount")}</Text>
                        <Text className="block text-slate-900">{item.amount || "0.00"} EUR</Text>
                      </Col>
                      <Col xs={24} md={4} className="md:text-right">
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          {t(`status.${normalizeStatus(item.status)}`)}
                        </Tag>
                      </Col>
                    </Row>

                    <div>
                      <Text className="text-slate-500 text-xs uppercase">{t("results.audit.maskedCodes")}</Text>
                      <div className="mt-2 space-y-1">
                        {(item.codes || []).map((code, codeIndex) => (
                          <Text key={`${item.id || index}-${codeIndex}`} className="block rc-mono text-slate-800">
                            {code}
                          </Text>
                        ))}
                      </div>
                    </div>

                    <Space className="w-full !justify-between" wrap>
                      <Text className="text-slate-500 text-sm">
                        <ClockCircleOutlined className="mr-1" /> {formatDate(item.createdAt || item.timestamp)}
                      </Text>
                      <Space>
                        <Button type="link" icon={<CopyOutlined />} onClick={() => handleCopyCodes(item.codes)}>
                          {t("results.audit.copy")}
                        </Button>
                        <Popconfirm
                          title={t("results.audit.deleteTitle")}
                          description={t("results.audit.deleteDescription")}
                          onConfirm={() => handleDelete(index)}
                          okText={t("results.audit.delete")}
                          cancelText={t("results.clearCancel")}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />}>
                            {t("results.audit.delete")}
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </PortalChrome>
  );
}
