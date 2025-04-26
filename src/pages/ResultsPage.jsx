import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Space,
  Card,
  Divider,
  message,
} from "antd";
import {
  CreditCardOutlined,
  ArrowLeftOutlined,
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
  CheckCircleOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;

export default function ResultsPage() {
  const [rechargeData, setRechargeData] = useState([]);

  useEffect(() => {
    // Récupérez les données depuis localStorage
    const data = JSON.parse(localStorage.getItem("rechargeData")) || [];
    setRechargeData(data);
  }, []);

  const handleCopyCodes = (codes) => {
    navigator.clipboard.writeText(codes.join("\n")).then(() => {
      message.success("Codes copiés dans le presse-papiers !");
    });
  };

  const handleDelete = (index) => {
    // Supprimer l'élément à l'index spécifié
    const updatedData = rechargeData.filter((_, i) => i !== index);
    // Mettre à jour le localStorage
    localStorage.setItem("rechargeData", JSON.stringify(updatedData));
    // Mettre à jour l'état
    setRechargeData(updatedData);
    message.success("Enregistrement supprimé avec succès !");
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
          className="rounded-xl shadow-xl p-4 sm:p-6 md:p-12 w-full max-w-full sm:max-w-4xl md:max-w-5xl border-t-4 border-[#FF3366] transform transition-all duration-500 hover:shadow-2xl"
          style={{ background: "linear-gradient(145deg, #FFFFFF, #F8F9FA)" }}
        >
          <div className="text-center mb-6 sm:mb-10">
            <Title
              level={2}
              className="text-[#1A1A2E] font-extrabold tracking-tight mb-2 text-xl sm:text-2xl md:text-3xl"
            >
              Historique des Vérifications
            </Title>
            <Text className="text-gray-600 text-sm sm:text-base flex items-center justify-center gap-2">
              <WalletOutlined className="text-[#FF3366]" /> Détails de vos soumissions
            </Text>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rechargeData.length > 0 ? (
              rechargeData.map((data, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Text className="block text-gray-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                    <WalletOutlined className="text-[#FF3366]" /> Type de Recharge
                  </Text>
                  <Text className="text-gray-600 text-sm sm:text-base">{data.rechargeType || "Non spécifié"}</Text>

                  <Text className="block text-gray-800 font-semibold flex items-center gap-2 mt-3 sm:mt-4 text-sm sm:text-base">
                    <CreditCardOutlined className="text-[#FF3366]" /> Montant (€)
                  </Text>
                  <Text className="text-gray-600 text-sm sm:text-base">{data.montant || "Non spécifié"}</Text>

                  <Text className="block text-gray-800 font-semibold flex items-center gap-2 mt-3 sm:mt-4 text-sm sm:text-base">
                    <CreditCardOutlined className="text-[#FF3366]" /> Codes
                  </Text>
                  {data.codes && data.codes.length > 0 ? (
                    data.codes.map((code, codeIndex) => (
                      <Text key={codeIndex} className="block text-gray-600 text-sm sm:text-base">
                        Code {codeIndex + 1}: {code}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-gray-600 text-sm sm:text-base">Aucun code soumis</Text>
                  )}

                  <Text className="block text-gray-800 font-semibold flex items-center gap-2 mt-3 sm:mt-4 text-sm sm:text-base">
                    <ClockCircleOutlined className="text-[#FF3366]" /> Date et Heure
                  </Text>
                  <Text className="text-gray-600 text-sm sm:text-base">{data.timestamp || "Non spécifié"}</Text>

                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyCodes(data.codes)}
                      className="text-[#FF3366] hover:text-[#FF66CC] transition-colors duration-300 font-medium text-sm sm:text-base flex items-center gap-1"
                    >
                      Copier les codes
                    </Button>
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300 font-medium text-sm sm:text-base flex items-center gap-1"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Text className="text-gray-600 text-sm sm:text-base text-center col-span-2">
                Aucune vérification enregistrée.
              </Text>
            )}
          </div>
          <div className="flex justify-center mt-6 sm:mt-10">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
              className="border-[#FF3366] text-[#FF3366] hover:border-[#FF66CC] hover:text-[#FF66CC] transition-colors duration-300 rounded-lg font-semibold text-sm sm:text-base"
            >
              Retour
            </Button>
          </div>
        </Card>
      </Content>

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