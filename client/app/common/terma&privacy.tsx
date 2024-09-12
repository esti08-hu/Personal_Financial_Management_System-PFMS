import { Button, Modal } from "antd";

interface PrivacyProps {
  privacyVisible: boolean;
  setPrivacyVisible: (visible: boolean) => void;
}

interface TermsProps {
  termsVisible: boolean;
  setTermsVisible: (visible: boolean) => void;
}

export const Terms: React.FC<TermsProps> = ({
  termsVisible,
  setTermsVisible,
}) => {
  return (
    <Modal
      open={termsVisible}
      onCancel={() => setTermsVisible(false)}
      footer={
        <Button
          onClick={() => setTermsVisible(false)}
          className="bg-[#00ABCD] text-white hover:bg-[#1ed9fe]"
        >
          Close
        </Button>
      }
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
        <p className="mb-6 text-gray-600">
          Welcome to Money Master! By accessing or using our website, you agree
          to comply with and be bound by the following terms and conditions of
          use, which together with our privacy policy govern moneymaster's
          relationship with you in relation to this website.
        </p>
        <ul className="list-disc list-inside space-y-4 text-gray-600">
          <li>
            <strong>Acceptance of Terms:</strong> By accessing and using this
            website, you accept and agree to be bound by the terms and
            provisions of this agreement.
          </li>
          <li>
            <strong>Modification of Terms:</strong> Money Master reserves the
            right to change these terms at any time. We will notify you of any
            changes by posting the new terms on this page.
          </li>
          <li>
            <strong>Use of the Site:</strong> You agree to use the site only for
            lawful purposes and in a way that does not infringe the rights of
            others.
          </li>
          <li>
            <strong>Intellectual Property:</strong> All content included on this
            site, such as text, graphics, logos, images, and software, is the
            property of Money Master or its content suppliers.
          </li>
          <li>
            <strong>Limitation of Liability:</strong> Money Master will not be
            liable for any damages of any kind arising from the use of this
            site.
          </li>
          <li>
            <strong>Governing Law:</strong> These terms are governed by and
            construed in accordance with the laws of Ethio.
          </li>
        </ul>
      </div>
    </Modal>
  );
};

export const Privacy: React.FC<PrivacyProps> = ({
  privacyVisible,
  setPrivacyVisible,
}) => {
  return (
    <Modal
      open={privacyVisible}
      onCancel={() => setPrivacyVisible(false)}
      footer={
        <Button
          onClick={() => setPrivacyVisible(false)}
          className="bg-[#00ABCD] text-white hover:bg-[#1ed9fe]"
        >
          Close
        </Button>
      }
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Privacy Policy
        </h2>
        <p className="mb-6 text-gray-600">
          At Money Master, we are committed to protecting your privacy. This
          Privacy Policy outlines our practices regarding the collection, use,
          and disclosure of your information.
        </p>
        <ul className="list-disc list-inside space-y-4 text-gray-600">
          <li>
            <strong>Information Collection:</strong> We collect information from
            you when you register on our site, place an order, subscribe to our
            newsletter, or fill out a form.
          </li>
          <li>
            <strong>Use of Information:</strong> The information we collect may
            be used to personalize your experience, improve our website, and
            process transactions.
          </li>
          <li>
            <strong>Protection of Information:</strong> We implement security
            measures to protect your personal information during transactions.
          </li>
          <li>
            <strong>Disclosure of Information:</strong> We do not sell or
            transfer your personal information to outside parties without your
            consent, except to trusted third parties.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies to save your preferences
            for future visits and analyze site traffic.
          </li>
          <li>
            <strong>Changes to Our Privacy Policy:</strong> Any changes to this
            policy will be posted on this page.
          </li>
          <li>
            <strong>Contact Us:</strong> If you have any questions, contact us
            at estioTech@gmail.com or +25197736****.
          </li>
        </ul>
      </div>
    </Modal>
  );
};
