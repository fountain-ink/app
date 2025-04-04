import { Metadata } from "next";
import { proseClasses } from "@/styles/prose";
import { ArticleLayout } from "@/components/navigation/article-layout";
export const metadata: Metadata = {
  title: "Privacy Policy | Fountain",
  description: "Privacy policy for Fountain - how we handle your data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center max-w-md sm:max-w-lg md:max-w-xl mx-auto">
      <ArticleLayout>
        <header className="title">Privacy Policy</header>
        <header className="subtitle">Last updated: 4 April 2025</header>

        <p className="text-start">
          This Privacy Policy (the "Privacy Policy") explains how Fountain Labs OÜ ("we," "our," or "us") collects, uses, and shares information in connection with the application accessible via Fountain.ink (the "Site") as well as your rights and choices regarding such information.
        </p>
        <p className="text-start">
          These terms apply to the Site and any other online location that links to this Privacy Policy (collectively, the "Services"). By using the Services, you also agree to our collection, use, and sharing of your information as described in this Privacy Policy. If you do not agree with the terms, you should not use or access the Site or the Services.
        </p>
        <h1>1. Information Collection.</h1>
        <h2>A. Information You Provide.</h2>
        <p className="text-start">
          We may collect the following information about you when you use the Services:
        </p>
        <ul>
          <li>
            <strong>Payment information.</strong> Should you pay for your Profile, your payment information is provided this is provided to stripe for payment.
          </li>
          <li>
            <strong>Correspondence and Content.</strong> Within any messages you send to us (such as feedback and questions to information support), we may collect your name and contact information, as well as any other content included in the message.
          </li>
        </ul>
        <p className="text-start">
          You may choose to voluntarily provide other information to us that we have not solicited from you, and, in such instances, you are solely responsible for such information.
        </p>
        <h1>B. Information Collected Automatically.</h1>
        <p className="text-start">We collect the following information:</p>
        <ul>
          <li>
            <strong>Device Information.</strong> We may collect information about the device you use to access the Site, such as the device type, operating system, browser type, and screen height and width. This information helps us to optimize the Site for different devices and troubleshoot any technical issues.
          </li>
          <li>
            <strong>Usage Information.</strong> We collect information about how you interact with our Site and Services, capturing data to enhance user experience and service functionality. This includes interaction data, such as the pages you visit, the features and assets you engage with, the links you click on, and the search queries you enter, providing us insight into user preferences and site navigation patterns. Technical metrics like your browser version, the current URL you are visiting, device information, screen dimensions, and system settings help us optimize our site for various devices and troubleshoot potential issues. We also gather behavioral metrics, including the names of events you participate in and your navigation choices. Analytical data such as session duration, event counts, and user behavior patterns are collected to measure engagement and improve Site usability. Personal preferences and behavior data, including your language settings and how you choose to use assets as collateral, help tailor the user experience. Additionally, we track engagement and conversion metrics through marketing and analytics data, including UTM sources, campaign data, search keywords, and content interactions, to better understand user engagement to improve the Services. By analyzing this data, we gain a deeper understanding of user behavior, which in turn allows us to make continuous improvements to the Site and enhance the overall user experience.
          </li>
        </ul>
        <p className="text-start">
          The types of tracking technologies we use to automatically collect information include the following:
        </p>
        <ul>
          <li>
            <strong>Log Files,</strong> which are files that record events that occur in connection with your use of the Services. Log files are created when you view content or otherwise interact with the Services.
          </li>
          <li>
            <strong>Cookies,</strong> which are small data files stored on your device that act as a unique tag to identify your browser. Users can control the use of cookies at the individual browser level. For more information, please see the section entitled "Cookies Policy" below.
          </li>
        </ul>
        <p className="text-start">
          For further information on how we use tracking technologies for analytics and your rights and choices regarding them, please see the "Cookies Policy" sections below.
        </p>
        <h1>2. Use of Information.</h1>
        <p className="text-start">
          We may collect and use, information for business purposes in accordance with the practices described in this Privacy Policy. Our business purposes for collecting and using information include:
        </p>
        <ul>
          <li>
            <strong>Process transactions and send related information, including confirmations.</strong> We may process payments through third-party payment processors, such as Stripe, which have their own privacy policies.
          </li>
          <li>
            <strong>Operating and managing the Services (including through authorized service providers).</strong> To make the Services available to you and perform services requested by you, such as responding to your comments, questions, and requests, and providing information support; sending you technical notices, updates, security alerts, information regarding changes to our policies, and support, administrative messages; detecting, preventing, and addressing fraud, breach of Terms, and threats, or harm; and compliance with legal and regulatory requirements.
          </li>
          <li>
            <strong>Improving the Services.</strong> To continually improve the Services and fulfilling any other legitimate business purpose, as permitted under applicable laws.
          </li>
          <li>
            <strong>Merger or Acquisition.</strong> In connection with, or during negotiations of, any proposed or actual merger, purchase, sale or any other type of acquisition, financing, reorganization or business combination of all or any portion of our assets, or transfer of all or a portion of our business to another business.
          </li>
          <li>
            <strong>Security and compliance with laws.</strong> As we believe necessary or appropriate to operate and maintain the security or integrity of Site, including to prevent or stop an attack on our computer systems or networks or investigating possible wrongdoing in connection with the Site; enforce our Terms; and comply with applicable laws, lawful requests and legal process, such as to respond to subpoenas or requests from government authorities.
          </li>
          <li>
            <strong>Facilitating Requests.</strong> To comply with your requests or directions.
          </li>
          <li>
            <strong>Consent.</strong> Purposes for which we have obtained your consent, as required by applicable laws.
          </li>
        </ul>
        <p className="text-start">
          Notwithstanding the above, we may use information that does not identify you (including information that has been aggregated or de-identified) for any purpose except as prohibited by applicable law. For information on your rights and choices with respect to how we use information about you, please see the "Cookies Policy" section below.
        </p>
        <h1>3. Sharing and Disclosure of Information.</h1>
        <p className="text-start">
          We may share or disclose information that we collect in accordance with the practices described in this Privacy Policy and for the purposes set out in the "Use of Information" section above.
        </p>
        <p className="text-start">
          The categories of parties with whom we may share information include:
        </p>
        <ul>
          <li>
            <strong>Affiliates.</strong> We share information with our affiliates and related entities, including where they act as our service providers or for their own internal purposes.
          </li>
          <li>
            <strong>Professional Advisors.</strong> We share information with our professional advisors for purposes of audits and compliance with our legal obligations.
          </li>
          <li>
            <strong>Service Providers.</strong> We share information with third-party service providers for business purposes, including payment processors, fraud detection and prevention, security threat detection, data analytics, information technology and storage, and blockchain transaction monitoring. Any information shared with such service providers is subject to the terms of this Privacy Policy. All service providers that we engage with are restricted to only utilizing the information on our behalf and in accordance with our instructions.
          </li>
        </ul>
        <p className="text-start">
          Notwithstanding the above, we may share information that does not identify you (including information that has been aggregated or de-identified) except as prohibited by applicable law.
        </p>
        <h1>4. Third-Party Services. </h1>
        <p className="text-start">
          We may also integrate technologies operated or controlled by other parties into parts of the Services. For example, the Services may include links that hyperlink to websites, platforms, and other services not operated or controlled by us.
        </p>
        <p className="text-start">
          Please note that when you interact with other parties, including when you leave the Site, those parties may independently collect information about you and solicit information from you. The information collected and stored by those parties remains subject to their own policies and practices, including what information they share with us, your rights and choices on their services and devices, and whether they store information in the U.S. or elsewhere. We encourage you to familiarize yourself with and consult their privacy policies and terms of use.
        </p>
        <p className="text-start">
          For example, by using a third-party wallet to engage in transactions on public blockchains, your interactions with any third-party wallet provider are governed by the applicable terms of service and privacy policy of that wallet provider.
        </p>
        <h1>5. Cookies Policy.</h1>
        <p className="text-start">
          We understand that your privacy is important to you and are committed to being transparent about the technologies we use. In the spirit of transparency, this Cookies Policy provides detailed information about how and when we use cookies on our Site.
        </p>
        <h2>A. Do we use cookies?</h2>
        <p className="text-start">
          We use cookies and other technologies to understand how you use our Site so we can improve its design and functionality (to ensure everyone who uses the Site has the best possible experience).
        </p>
        <h2 className="text-start">B. What is a cookie?</h2>
        <p className="text-start">
          A cookie is a small text file that is placed on your hard drive by a web page server. Cookies contain information that can later be read by a web server in the domain that issued the cookie to you. Some of the cookies will only be used if you use certain features or select certain preferences, and some cookies will always be used. You can find out more about each cookie by viewing our current cookie list below. We update this list periodically, so there may be additional cookies that are not yet listed.
        </p>
        <h2>C. Why would we use cookies?</h2>
        <p className="text-start">
          We use cookies and other similar identifiers only to compile aggregate data about Site traffic and site interaction to offer better user experiences and tools in the future.
        </p>
        <h2>D. What types of cookies do we use?</h2>
        <ul>
          <li>
            <strong>Strictly Necessary Cookies:</strong> These cookies are essential for the Site to function properly and enable basic features such as page navigation and access to secure areas of the site. They do not collect personal information.
          </li>
          <li>
            <strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization of the website. They may remember your preferences, such as the wallet you previously used to connect.
          </li>
        </ul>
        <h2>E. How to disable cookies?</h2>
        <p className="text-start">
          You can generally activate or later deactivate the use of cookies through a functionality built into your web browser. If you want to learn more about cookies, or how to control, disable or delete them, please visit{" "}
          <a href="http://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer">
            http://www.aboutcookies.org
          </a>{" "}
          for detailed guidance.
        </p>
        <p className="text-start">
          However, if you choose to disable cookies, you may be unable to access certain parts of the Site.
        </p>
        <h1>6. Data Security.</h1>
        <p className="text-start">
          We implement and maintain reasonable administrative, physical, and technical security safeguards to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Nevertheless, transmission via the Internet is not completely secure and we cannot guarantee the security of information about you.
        </p>
        <h1>7. Data Retention.</h1>
        <p className="text-start">
          Please note that we retain information we collect as long as it is necessary to fulfill the purpose for which it was collected, as outlined in this Privacy Policy, and to the extent permitted by applicable legal requirements. Where you request the deletion of your information, we may continue to retain and use your information as permitted or required under applicable laws, for legal, tax, or regulatory reasons, or legitimate and lawful business purposes.
        </p>
        <h1>8. International Transfers.</h1>
        <p className="text-start">
          Please be aware that information collected through the Services may be transferred to, processed, stored, and used in the European Economic Area, the United Kingdom, and other jurisdictions. Data protection laws in the EU and other jurisdictions may be different from those of your country of residence. Your use of the Services or provision of any information therefore constitutes your consent to the transfer to and from, processing, usage, sharing, and storage of information about you in the EU and other jurisdictions as set out in this Privacy Policy.
        </p>
        <h1>9. Children.</h1>
        <p className="text-start">
          The Services are intended for general audiences and are not directed at children. To use the Services, you must legally be able to enter into the Agreement. We do not knowingly collect personal information (as defined by the U.S. Children's Privacy Protection Act, or "COPPA") from children. If you are a parent or guardian and believe we have collected personal information in violation of COPPA, please contact us at{" "}
          <a href="mailto:privacy@fountain.ink" target="_blank" rel="noopener noreferrer">
            privacy@fountain.ink
          </a>{" "}
          and we will remove the personal information in accordance with COPPA.
        </p>
        <h1>10. Additional Disclosures for California Residents.</h1>
        <p className="text-start">
          These additional disclosures apply only to California residents. The California Consumer Privacy Act of 2018 ("CCPA") provides additional rights to know, delete, and opt-out, and requires businesses collecting or disclosing personal information to provide notices and the means to exercise consumer rights.
        </p>
        <h2>A. Notice of Collection.</h2>
        <p className="text-start">
          For further details on the information we may collect, including the sources from which we receive information, review the "Information Collection" section above. We may collect and use these categories of personal information for the business purposes described in the "Use of Information" section above, including to manage the Services.
        </p>
        <p className="text-start">
          We do not "sell" personal information as defined under the CCPA. Please review the "Sharing and Disclosure of Information" section above for further details about the categories of parties with whom we share information.
        </p>
        <h2>B. Right to Know and Delete.</h2>
        <p className="text-start">
          You have the right to know certain details about our data practices within the past twelve (12) months. In particular, you may request the following from us:
        </p>
        <ul>
          <li>The categories of personal information we have collected about you;</li>
          <li>The categories of sources from which the personal information was collected;</li>
          <li>The categories of personal information about you we disclosed for a business purpose;</li>
          <li>The categories of third parties to whom the personal information was disclosed for a business purpose;</li>
          <li>The business or commercial purpose for collecting or selling the personal information; and</li>
          <li>The specific pieces of personal information we have collected about you.</li>
        </ul>
        <p className="text-start">
          In addition, you have the right to delete the personal information we have collected from you.
        </p>
        <p className="text-start">
          To exercise any of these rights, please submit a request by emailing us at{" "}
          <a href="mailto:privacy@fountain.ink" target="_blank" rel="noopener noreferrer">
            privacy@fountain.ink
          </a>
          . In the request, please specify which right you are seeking to exercise and the scope of the request. We will confirm receipt of your request within ten (10) days. We may require specific information from you to help us verify your identity and process your request. If we are unable to verify your identity, we may deny your requests to know or delete.
        </p>
        <h2>C. Authorized Agent.</h2>
        <p className="text-start">
          You may designate an authorized agent to submit requests on your behalf; however, we may require written proof of the agent's permission to act on your behalf and verify your identity directly.
        </p>
        <h2>D. Right of Non-Discrimination.</h2>
        <p className="text-start">
          You have a right of non-discrimination for the exercise of any of your privacy rights guaranteed by law, such as the right to access, delete, or opt-out of the sale of your personal information.
        </p>
        <h2>E. Shine the Light.</h2>
        <p className="text-start">
          Customers who are residents of California may request (i) a list of the categories of personal information disclosed by us to third parties during the immediately preceding calendar year for those third parties' own direct marketing purposes; and (ii) a list of the categories of third parties to whom we disclosed such information. To exercise a request, please write to us at the email or postal address set out in the "Contact Us" section above and specify that you are making a "California Shine the Light Request." We may require additional information from you to allow us to verify your identity and are only required to respond to requests once per calendar year.
        </p>
        <h1>11. Additional Disclosures for Data Subjects in the European Economic Area and the United Kingdom.</h1>
        <h2>A. Roles.</h2>
        <p className="text-start">
          The General Data Protection Regulations in the European Economic Area and General Data Protection Regulations in the United Kingdom ("GDPR") distinguish between organizations that process personal data for their own purposes (known as "controllers") and organizations that process personal data on behalf of other organizations (known as "processors"). We act as a controller with respect to personal data collected as you interact with the Services.
        </p>
        <h2>B. Lawful Basis for Processing.</h2>
        <p className="text-start">
          The GDPR requires a "lawful basis" for processing personal data. Our lawful bases include where: (i) you have given consent to the processing for one or more specific purposes, either to us or to our service providers or partners; (ii) processing is necessary for the performance of a contract with you; (iii) processing is necessary for compliance with a legal obligation; or (iv) processing is necessary for the purposes of the legitimate interests pursued by us or a third party, and your interests and fundamental rights and freedoms do not override those interests. Where applicable, we will transfer your personal data to third parties subject to appropriate or suitable safeguards, such as standard contractual clauses.
        </p>
        <table>
          <thead>
            <tr>
              <th><strong>Purpose</strong></th>
              <th><strong>Legal Basis</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Operating and managing the Services</td>
              <td>Necessary for the performance of our agreement</td>
            </tr>
            <tr>
              <td>To communicate with you Improving the Services To provide our Services</td>
              <td>Legitimate interests, Consent</td>
            </tr>
            <tr>
              <td>Merger or Acquisition</td>
              <td>Legitimate interests, legal obligation (when communicating with EEA, U.K. and Swiss regulatory bodies)</td>
            </tr>
            <tr>
              <td>Security and compliance with laws</td>
              <td>Legal obligation, legitimate interests, necessary for the performance of our agreement</td>
            </tr>
            <tr>
              <td>Other purposes for which we have obtained your consent</td>
              <td>Consent</td>
            </tr>
          </tbody>
        </table>
        <h2>C. Your Data Subject Rights.</h2>
        <p className="text-start">
          If you are a user in the European Economic Area or the United Kingdom, you maintain certain rights under the GDPR. These rights include the right to (i) request access and obtain a copy of your personal data; (ii) request rectification or erasure of your personal data; (iii) object to or restrict the processing of your personal data; and (iv) request portability of your personal data. Additionally, if we have collected and processed your personal data with your consent, you have the right to withdraw your consent at any time.
        </p>
        <p className="text-start">
          Notwithstanding the foregoing, we cannot edit or delete information that is stored on a particular blockchain. This information may include transaction data (i.e., purchases, sales, and transfers) related to your blockchain wallet address and any items held by your wallet address.
        </p>
        <p className="text-start">
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:privacy@fountain.ink" target="_blank" rel="noopener noreferrer">
            privacy@fountain.ink
          </a>{" "}
          and specify which right you are seeking to exercise. We will respond to your request within thirty (30) days. We may require specific information from you to help us confirm your identity and process your request. Please note that we retain information as necessary to fulfill the purpose for which it was collected and may continue to retain and use information even after a data subject request in accordance with our legitimate interests, including as necessary to comply with our legal obligations, resolve disputes, prevent fraud, and enforce our agreements.
        </p>
        <p className="text-start">
          If you have any issues with our compliance, please contact us at{" "}
          <a href="mailto:privacy@fountain.ink" target="_blank" rel="noopener noreferrer">
            privacy@fountain.ink
          </a>
          . You also reserve the right to lodge a complaint with the data protection regulator in your jurisdiction.
        </p>
        <h1>12. Changes to this Privacy Policy.</h1>
        <p className="text-start">
          We reserve the right to revise and reissue this Privacy Policy at any time. Any changes will be effective immediately upon our posting of the revised Privacy Policy. For the avoidance of doubt, your continued use of the Services indicates your consent to the revised Privacy Policy then posted.
        </p>
        <h1>13. Contact Us.</h1>
        <p className="text-start">
          If you have any questions or comments about this Privacy Policy, our data practices, or our compliance with applicable law, please contact us by email:{" "}
          <a href="mailto:privacy@fountain.ink" target="_blank" rel="noopener noreferrer">
            privacy@fountain.ink
          </a>
        </p>
      </ArticleLayout>
    </div>
  );
} 