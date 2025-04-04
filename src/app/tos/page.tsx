import { proseClasses } from "@/styles/prose";
import { Metadata } from "next";
import { ArticleLayout } from "@/components/navigation/article-layout";

export const metadata: Metadata = {
  title: "Terms of Service | Fountain",
  description: "Terms of service for Fountain",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col items-center max-w-md sm:max-w-lg md:max-w-xl mx-auto">
      <ArticleLayout>
        <header className="title">Terms of Service</header>
        <header className="subtitle">Last updated: 4 April 2025</header>
        <p className="text-start">
          <blockquote className="blockquote">
            We have included a simple version of our Terms and Conditions in TL;DRs for each section to make it easier
            for you to understand them. The TL;RDs do not form part of the terms, but they can help you quickly grasp
            the main points of the terms and make informed decisions because we understand that the terms can be
            difficult to read with a lot of legal language and technical terms. We also wanted to explain how new
            technologies like blockchain may impact our Services.
          </blockquote>
        </p>
        <p className="text-start">
          These websites (each individually, a "Site" or jointly "Sites") are operated by{" "}
          <strong>Fountain Labs OÜ</strong> ("Company", "we", "us" and "our"). We offer the Sites, including all
          information, tools and services available from these Sites (collectively, the "Services") to you to allow you
          to interact with the Lens Protocol - a composable and decentralized social graph conditioned upon your
          acceptance of all terms and conditions ("Terms"), including those additional terms and conditions and policies
          referenced herein and/or available by hyperlink (collectively, the "Agreement").
        </p>
        <p className="text-start">
          By visiting the Sites and/or using the Services, you agree to be bound by the Agreement. Please read these
          Terms carefully before accessing or using the Sites. If you do not agree to all the terms of the Agreement,
          then you should not access the Site or use the Services.
        </p>
        <p className="text-start">
          You can review the most current version of the terms at any time on the Site. We reserve the right to update,
          change or replace any part of these terms by posting updates and/or changes to our Site. It is your
          responsibility to check this page periodically for changes. Your continued use of or access to the Site
          following the posting of any changes constitutes acceptance of those changes.
        </p>
        <p className="text-start">
          ARBITRATION NOTICE: THESE TERMS CONTAIN AN ARBITRATION CLAUSE BELOW. EXCEPT FOR CERTAIN TYPES OF DISPUTES
          MENTIONED IN THAT ARBITRATION CLAUSE, YOU AND WE AGREE THAT ANY DISPUTES RELATING TO THE SERVICES WILL BE
          RESOLVED BY MANDATORY BINDING ARBITRATION, AND YOU WAIVE ANY RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE IN A
          CLASS-ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
        </p>
        <h1>1. Services.</h1>
        <p id="GgFPYiFR80" className="text-start">
          <blockquote className="blockquote">
            You may use our Sites only if it's legal for you to agree to our terms (by virtue of age or otherwise). You
            may not use the Services for anything illegal. The Site and our Services evolve constantly and may change
            from time to time, at our discretion.
          </blockquote>
        </p>
        <p className="text-start">
          To use the Services, you must legally be able to enter into the Agreement. By using the Services, you
          represent and warrant that you meet the eligibility requirement. If you do not meet the requirement, you must
          not access or use the Site or the Services.
        </p>
        <p className="text-start">
          You may not use our Services for any illegal or unauthorized purpose nor may you, in the use of the Service,
          violate any laws in your jurisdiction.
        </p>
        <p className="text-start">
          The Sites and Services evolve constantly. As such, the Sites and Services may change from time to time, at our
          discretion. We may stop (permanently or temporarily) providing the Services or any features within the
          Services to you or to users generally.
        </p>
        <h2>Services involve immutable on-chain blockchain interactions with the Lens Protocol.</h2>
        <p className="text-start">
          <blockquote className="blockquote">
            Please note that the Lens Protocol lives on the public and immutable blockchain, which means that all
            entries will be forever discoverable. If you're not comfortable with the public nature of the blockchain
            entries, you should not interact with the Lens Protocol.
          </blockquote>
        </p>
        <p className="text-start">
          By using the part of Services which involves on-chain interactions with the Lens Protocol, you understand you
          are interacting with an inherently public blockchain-based system. On-chain interactions with the Lens
          Protocol (such as the creation of a Lens Profile, posting or commenting on User Content on-chain, mirroring
          and collecting publications) are created as immutable entities on the blockchain, therefore the history of
          interactions with to the Lens Profile can be tracked.
        </p>
        <p className="text-start">
          If you are not comfortable with the inherently immutable and public nature of all entries on the blockchain,
          you should not use our Service that involve on-chain interactions or create or manage a Profile on the Lens
          Protocol.
        </p>
        <p className="text-start">
          In order to access and use certain features of the Service, you must connect to the Service a software-based
          digital wallet that allows you to mint, collect, store and engage in transactions with the blockchain (each a
          "Wallet"). ALL BLOCKCHAIN INTERACTIONS INITIATED THROUGH OUR SERVICES ARE effected by third-party wallet
          extensions. By using our Services you agree that such transactions are covered by the terms of service and
          privacy policy for the applicable extensions.
        </p>
        <h2>Lens Protocol user interactions are governed by application-specific terms and conditions.</h2>
        <p className="text-start">
          <blockquote className="blockquote">
            Lens Protocol functions as a decentralized social graph, not bound to a single client, requiring users to
            adhere to the terms and conditions of the specific application interface they use for interaction.
          </blockquote>
        </p>
        <p className="text-start">
          Lens Protocol operates as a decentralized social graph, which means it does not rely on a single client for
          its functionality. Instead, it enables a variety of applications to interact with its network. When engaging
          with the Lens Protocol through your Profile, it is imperative to understand that your activities are subject
          to the governing terms and conditions of the specific application interface utilized for such interactions.
        </p>
        <h2>Our Site allows you to mint a Profile on the Lens Protocol.</h2>
        <p id="sGPQ3kMOd7" className="text-start">
          <blockquote className="blockquote">
            You can claim a Lens Profile which is created to your self-custodial blockchain Wallet. We may choose to set
            limitations on the claiming or stop it entirely.
          </blockquote>
        </p>
        <p className="text-start">
          The Site allows you to mint a Lens Protocol profile token ("Profile"). The Profile is created to the Wallet
          that controls the Profile with the ability to create and contain the history of the content on the Lens
          Protocol, including all the posts, mirrors, comments and other content originating from that Profile
          ("Items"). You should not assume that minting a Profile gives you any legal rights beyond mere ownership of
          the underlying blockchain asset.
        </p>
        <p className="text-start">
          We reserve the right - but are not obligated to - limit the provision of Profiles to any person, geographic
          region or jurisdiction. We may exercise this right on a case-by-case basis in our sole discretion. We reserve
          the right to limit the type, amount, and quantity of any Profiles which can be claimed via this Site. We
          reserve the right to discontinue claiming Profiles at any time.
        </p>
        <h2>You are ultimately in control of your Profile.</h2>
        <p id="-qxXekTv1z" className="text-start">
          <blockquote className="blockquote">
            You, and only you, are in control of your Profile. Use this power carefully.
          </blockquote>
        </p>
        <p className="text-start">
          You understand that when you interact with any Lens Protocol smart contracts, you retain control over your
          Profile at all times. It is important to understand that neither we nor any affiliated entity is a party to
          any transaction on the blockchain networks underlying the Lens Protocol; we do not have possession, custody or
          control over any Items on your Wallet (including, but not limited to Profiles); and we do not have possession,
          custody, ability to delete or control any Items on any user's Wallet or any Profile's interactions with the
          Lens Protocol.
        </p>
        <h2>You are responsible for securing the Wallet that contains your Profile.</h2>
        <p id="6oReUpSToy" className="text-start">
          <blockquote className="blockquote">Keep your wallet safe. You are responsible for it.</blockquote>
        </p>
        <p className="text-start">
          You are responsible for safeguarding your Profile and Wallet. We cannot and will not be liable for any loss or
          damage arising from your failure to secure your Wallet.
        </p>
        <p className="text-start">
          The private key associated with the Wallet address from which you use to claim Profile or the private key
          associated is the only private key that can control the Wallet you use to interact with the smart contracts.
          You alone are responsible for securing your private keys. We do not have access to your private keys.
        </p>
        <h1 id="NEuE73ZzPx">2. Blockchains.</h1>
        <h2 id="wmcyHFaJ6o">Entries on the blockchain are not anonymous.</h2>
        <p className="text-start">
          <blockquote className="blockquote">
            You are interacting with an inherently transparent blockchain. Transparency does not mean anonymity, but
            your public key and wallet address will be visible to everyone. If you're not comfortable with this, you
            should not engage with blockchain-based services.
          </blockquote>
        </p>
        <h2>
          You assume the risks of engaging in transactions that rely on smart contracts and other experimental
          technology.
        </h2>
        <p className="text-start">
          <blockquote className="blockquote">
            Using the Lens Protocol involves new and risky technology like blockchain and smart contracts.
          </blockquote>
        </p>
        <p className="text-start">
          Transactions on the Lens Protocol rely on smart contracts stored on a blockchain, cryptographic tokens
          generated by the smart contracts, and other nascent software, applications and systems that interact with
          blockchain-based networks. These technologies are experimental, speculative, inherently risky, and subject to
          change.
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            This technology can be vulnerable to bugs, cyberattacks, and other problems that may cause you to lose your
            tokens or digital funds.
          </blockquote>
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            We will not be held responsible for any problems you may encounter. If you don't want to take the risk, you
            should not use the Lens Protocol.
          </blockquote>
        </p>
        <p className="text-start">
          Among other risks, bugs, malfunctions, cyberattacks, or changes to the applicable blockchain (e.g., forks)
          could disrupt these technologies and even result in a total loss of tokens, crypto assets, their market value,
          or digital funds. You are solely responsible for the safekeeping of the private key associated with the
          blockchain address used to interact with the Lens Protocol. We assume no liability or responsibility for any
          such risks. If you are not comfortable assuming these risks, you should not access or engage in transactions
          using blockchain-based technology.
        </p>
        <p className="text-start">
          One of the other defining features of blockchain technology is that its entries are immutable, which means, as
          a technical matter, they generally cannot be deleted or modified by anyone. This includes smart contracts and
          tokens generated and programmed by smart contracts.
        </p>
        <p className="text-start">
          THUS, TRANSACTIONS RECORDED ON THE BLOCKCHAIN, INCLUDING TRANSFERS OF TOKENS AND DATA PROGRAMMED INTO THESE
          TOKENS, MUST BE TREATED AS PERMANENT AND CANNOT BE UNDONE BY US OR BY ANYONE.{" "}
          <strong>
            YOU MUST BE VERY CAREFUL WHEN YOU FINALIZE ANY ENTRY OR TRANSACTION THAT WILL BE RECORDED ON THE BLOCKCHAIN.
          </strong>
        </p>
        <h2>You acknowledge the risks of using the Services.</h2>
        <p id="zPnbvLrl7m" className="text-start">
          <blockquote className="blockquote">
            You bear sole responsibility for evaluating the Services before using them.
          </blockquote>
        </p>
        <p className="text-start">
          You bear sole responsibility for evaluating the Services before using them, and all transactions and
          blockchain entries accessed through the Services are irreversible, final, and without refunds. The Services
          may be disabled, disrupted or adversely impacted as a result of sophisticated cyber-attacks, surges in
          activity, computer viruses, and/or other operational or technical challenges, among other things. We disclaim
          any ongoing obligation to notify you of all of the potential risks of using and accessing our Services. You
          agree to (defined below) accept these risks and agree that you will not seek to hold any Fountain Labs OÜ
          Indemnified Party responsible for any consequent losses.
        </p>
        <h2>
          The Lens Protocol is deployed on blockchain-based networks, and we are not responsible for the operation of
          such networks.
        </h2>
        <p className="text-start">
          <blockquote className="blockquote">
            The Lens Protocol is deployed on networks which we don't control.
          </blockquote>
        </p>
        <p className="text-start">
          The software underlying blockchain networks on which the Lens Protocol is deployed, is open source, which
          means that anyone can use, utilize, and build on top of it. By using the Services, you acknowledge and agree
          that (i) we are not responsible for the operation of the blockchain-based software and networks underlying the
          Lens Protocol, (ii) there exists no guarantee of the functionality, security, or availability of that software
          and networks, and (iii) the underlying blockchain-based networks are subject to sudden changes in operating
          rules, such as those commonly referred to as "forks".
        </p>
        <h2>The Services are provided to free of charge, however, there may be associated blockchain fees.</h2>
        <p className="text-start">
          <blockquote className="blockquote">
            Blockchains come with gas fees. We may pay for those fees on your behalf; however, we may choose to not pay
            for them at any time.
          </blockquote>
        </p>
        <h1>3. Intellectual Property Rights and Ownership.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            With respect to intellectual property rights and ownership - what's yours is yours.
          </blockquote>
        </p>
        <p className="text-start">
          Content creators and owners retain their existing rights to any content uploaded, edited, or minted via the
          Services. However, by using the Services, all users (including content creators and owners) grant limited
          licenses to one another to use their contributions in various ways, as discussed below.
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            You agree to provide us with a license to make the User Content available.
          </blockquote>
        </p>
        <p className="text-start">
          By submitting, posting or displaying Content on or through the Services, you grant us a worldwide,
          non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt,
          modify, publish, transmit, display and distribute such Content in any and all media or distribution methods
          now known or later developed (for clarity, these rights include, for example, curating, transforming, and
          translating). This license authorizes us to make your User Content available to the rest of the world and to
          let others do the same.
        </p>
        <p className="text-start">
          <blockquote className="blockquote">You confirm you have all the necessary rights to post content.</blockquote>
        </p>
        <p className="text-start">
          By posting content on our Sites, you represent and warrant that you have obtained all necessary intellectual
          property rights for such content, including but not limited to any trademark, copyright, patent, trade secret,
          or proprietary rights (including, without limitation, the performance, master recording and/or publishing
          rights for any musical or video content). You further represent and warrant that the posting and use of your
          content on our platform does not infringe or violate any third-party rights, including but not limited to any
          intellectual property rights, privacy rights, or publicity rights. Company does not assume any responsibility
          or liability for any unauthorized use of any User Content made available through the Sites.
        </p>
        <p className="text-start">
          Notwithstanding User Content, unless otherwise indicated in writing by us, the Service and all content and
          other materials contained therein, including, without limitation, the Lens Protocol logo and all designs,
          text, graphics, pictures, information, data, software, sound files, other files and the selection and
          arrangement thereof, are the proprietary property of Company.
        </p>
        <h1>4. Accuracy, Completeness and Timeliness of Information.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            We are not responsible for any mistakes or inaccuracies on this Site.
          </blockquote>
        </p>
        <p className="text-start">
          We are not responsible if information made available on this site is not accurate, complete or current. The
          material on this site is provided for general information only and should not be relied upon or used as the
          sole basis for making decisions without consulting primary, more accurate, more complete or more timely
          sources of information. Any reliance on the material on this site is at your own risk.
        </p>
        <p className="text-start">
          This Site may contain certain historical information. Historical information is not necessarily current and is
          provided for your reference only. We reserve the right to modify the contents of this Site at any time, but we
          have no obligation to update any information on our site. You agree that it is your responsibility to monitor
          changes to our Site.
        </p>
        <h1>5. Modifications to the Services.</h1>
        <p className="text-start">
          <blockquote className="blockquote">We may change or modify the Services at any time.</blockquote>
        </p>
        <p className="text-start">
          We reserve the right at any time to modify or discontinue the Services (or any part or content thereof)
          without notice at any time. We shall not be liable to you or any third-party for any modification, information
          change, suspension or discontinuance of the Services.
        </p>
        <h1>6. Third-Party Services, Links, Materials & Websites.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            We are not responsible for the content or services of any third-party, including, without limitation, any
            network, or apps like Discord, or MetaMask, and we make no representations regarding the content or accuracy
            of any of their services or materials. You should separately make sure you agree with their terms of use
            before using them.
          </blockquote>
        </p>
        <p className="text-start">
          The Site may include materials from third-parties. Third-party links on this Site may direct you to
          third-party websites, applications, or resources that are not affiliated with us, including other sites and
          services which allow you to interact with the Lens Protocol (including but not limited to any wallet
          extensions). We are not responsible for examining or evaluating the content or accuracy and we do not warrant
          and will not have any liability or responsibility for any third-party materials or websites, or for any other
          materials, products, or services of third-parties.
        </p>
        <p className="text-start">
          We are not liable for any harm or damages related to the order or use of goods, services, resources, content,
          or any other transactions made in connection with any third-party websites. Please review carefully the
          third-party's policies and practices and make sure you understand them before you engage in any transaction.
          Complaints, claims, concerns, or questions regarding third-party products should be directed to the
          third-party.
        </p>
        <h1>7. Personal Information.</h1>
        <p className="text-start">
          <blockquote className="blockquote">You should read our privacy policy.</blockquote>
        </p>
        <p className="text-start">
          Your submission of personal information through the Site is governed by our Privacy Policy.
        </p>
        <h1>8. Prohibited Uses.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            You are not allowed to use the Services for anything illegal, infringing intellectual property rights,
            harassment or otherwise abusive behavior, spreading false information or viruses, spamming, or interfering
            with the security features of the Services.
          </blockquote>
        </p>
        <p className="text-start">
          In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the Site
          or the Services: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful
          acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local
          ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property
          rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
          based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to
          submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code
          that will or may be used in any way that will affect the functionality or operation of the Services or of any
          related website, other websites, or the Internet; (h) to collect or track the personal information of others;
          (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k)
          to interfere with or circumvent the security features of the Services or any related website, other websites,
          or the Internet. We reserve the right to terminate your use of the Services or any related website for
          violating any of the prohibited uses.
        </p>
        <h1>9. Assumption of Risk.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            You assume the risks of using the Services (including the risks related to smart contracts). You are
            responsible for your wallet. We may restrict your access to the Services for any reason, including, but not
            limited, compliance with sanctions regulations. We don't guarantee the quality of the Services.
          </blockquote>
        </p>
        <h2>You agree to the automated collection and disbursement of proceeds by smart contracts.</h2>
        <p className="text-start">
          You acknowledge and agree that all transactions accessed through the Services will be automatically processed
          using one or more blockchain-based smart contracts. By engaging in transactions using the Services, you
          acknowledge and consent to the automatic processing of all transactions in connection with using the Services.
        </p>
        <h2>You are solely responsible for the security of your wallet.</h2>
        <p className="text-start">
          You understand and agree that you are solely responsible for maintaining the security of your wallet. Any
          unauthorized access to your wallet by third parties could result in the loss or theft of your Lens Profile,
          Items, any crypto asset, or any funds held in your account and any associated accounts. You understand and
          agree that we have no involvement in, and you will not hold us responsible for managing and maintaining the
          security of your wallet. You further understand and agree that we are not responsible, and you will not hold
          us accountable, for any unauthorized access to your wallet. It is your responsibility to monitor your wallet.
        </p>
        <h2>We reserve the right to restrict your access from engaging with the Services.</h2>
        <p className="text-start">
          You agree that we have the right to restrict your access to the Services via any technically available methods
          if we suspect, in our sole discretion, that (a) you are using the Services for money laundering or any illegal
          activity; (b) you have engaged in fraudulent activity; (c) you have acquired crypto assets using inappropriate
          methods, including the use of stolen funds to purchase such assets; (d) you are the target of any sanctions
          administered or enforced by the U.S. Department of the Treasury's Office of Foreign Assets Control ("OFAC"),
          the United Nations Security Council, the European Union, Her Majesty's Treasury, or any other legal or
          regulatory authority in any applicable jurisdiction; (e) either you, as an individual or an entity, or your
          wallet address is listed on the Specially Designated Nationals and Blocked Persons List ("SDN List"),
          Consolidated Sanctions List ("Non-SDN Lists), or any other sanctions lists administered by OFAC; (f) you are
          located, organized, or resident in a country or territory that is, or whose government is, the subject of
          sanctions, including but not limited to Côte d'Ivoire, Cuba, Belarus, Russia, Iran, Iraq, Liberia, North
          Korea, Sudan, and Syria; or (g) you have otherwise acted in violation of these Terms. If we have a reasonable
          suspicion that you are utilizing the Site for illegal purposes, we reserve the right to take whatever action
          we deem appropriate.
        </p>
        <h2>We do not guarantee the quality or accessibility of the Services.</h2>
        <p className="text-start">
          As a condition to accessing or using the Services or the Site, you acknowledge, understand, and agree that
          from time to time, the Site and the Services may be inaccessible or inoperable for any reason, including, but
          not limited to equipment malfunctions, periodic maintenance procedures or repairs, causes beyond our control
          or that we could not reasonably foresee, disruptions and temporary or permanent unavailability of underlying
          blockchain infrastructure or the unavailability of third-party service providers or external partners for any
          reason.
        </p>
        <p className="text-start">
          You acknowledge and agree that you will access and use the Services, including, without limitation, the Site
          at your own risk. You should not engage in blockchain-based transactions unless it is suitable given your
          circumstances and financial resources. By using the Services, you represent that you have been, are and will
          be solely responsible for conducting your own due diligence into the risks of a transaction and the underlying
          smart contracts and crypto assets.
        </p>
        <h1>10. Disclaimer of Warranties; Limitations of Liability.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            The Services are provided to you completely as they are, and could function differently than you had
            expected. You agree to accept the Services as is. You expressly agree that your use of, or inability to use,
            the Services is at your sole risk. Our liability shall be limited entirely or to the maximum extent
            permitted by law.
          </blockquote>
        </p>
        <p className="text-start">
          We do not guarantee, represent or warrant that your use of our Services will be uninterrupted, timely, secure
          or error-free.
        </p>
        <p className="text-start">
          We do not warrant that the results that may be obtained from the use of the Services will be accurate or
          reliable.
        </p>
        <p className="text-start">
          You agree that from time to time we may remove the Services for indefinite periods of time or cancel them at
          any time, without notice to you.
        </p>
        <p className="text-start">
          You expressly agree that your use of, or inability to use, the Services is at your sole risk. The Services are
          (except as expressly stated by us) provided "as is" and "as available" for your use, without any
          representation, warranties or conditions of any kind, either express or implied, including all implied
          warranties or conditions of fitness for a particular purpose, durability, title, and non-infringement.
        </p>
        <p className="text-start">
          In no case shall the Company, or its directors, officers, employees, affiliates, agents, contractors,
          suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect,
          incidental, punitive, special, or consequential damages of any kind, including, without limitation lost
          profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in
          contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the
          Services obtained using the service, or for any other claim related in any way to your use of the Services,
          including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind
          incurred as a result of the use of the Service or any content posted, transmitted, or otherwise made available
          via the Service, even if advised of their possibility. Because some states or jurisdictions do not allow for
          the exclusion or the limitation of liability for consequential or incidental damages, in such states or
          jurisdictions, our liability shall be limited to the maximum extent permitted by law.
        </p>
        <h1>11. Indemnification.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            You will be responsible for and cover our losses in circumstances where it would be unfair for us to bear
            the loss.
          </blockquote>
        </p>
        <p className="text-start">
          You agree to indemnify, defend and hold harmless the Company and Company parents, subsidiaries, affiliates,
          partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers,
          and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any
          third-party due to or arising out of your breach of these Terms or the anything they incorporate by reference,
          or your violation of any law or the rights of any third-party
        </p>
        <h1>12. Severability.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            The terms in these Terms of Service are independent of one another such that the remainder of the terms will
            remain in force if for any reason a court declares one or more of its provisions void or unenforceable.
          </blockquote>
        </p>
        <p className="text-start">
          In the event that any provision of these Terms is determined to be unlawful, void or unenforceable, such
          provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the
          unenforceable portion shall be deemed to be severed from these Terms of Service. Such determination shall not
          affect the validity and enforceability of any other remaining provisions.
        </p>
        <h1>13. Termination; Cancellation.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            This Agreement can be terminated at any time and for any reason, however, It will govern your activity as
            long as you keep using the Site or Services.
          </blockquote>
        </p>
        <p className="text-start">
          This Agreement is effective unless and until terminated by either you or us. You may terminate the Agreement
          with us at any time by not accessing the Site or the Services. If, in our sole judgment, you fail, or we
          suspect that you have failed, to comply with any term or provision of the Agreement (including without
          limitation any provision of the Terms of Service), we reserve the right to terminate our Agreement with you
          and deny you access to the Services. We further reserve the right to restrict your access to the Site in any
          way or to stop providing you with all or a part of the Services at any time and for no reason, including,
          without limitation, if we reasonably believe: (a) your use of the Services exposes us to risk or liability;
          (b) you are using the Services for unlawful purposes; or (c) it is not commercially viable to continue
          providing you with our Services. The aforementioned does not limit any other rights and remedies that may be
          available to us, whether in equity or at law, all of which we expressly reserve.
        </p>
        <h1>14. Entire Agreement.</h1>
        <p className="text-start">
          <blockquote className="blockquote">
            You should only rely on this Agreement. If anything in this Agreement is deemed unclear, it should not be
            held against us. If we have a right under these Terms and we don't exercise it, we can still exercise such
            right in the future.
          </blockquote>
        </p>
        <p className="text-start">
          The Agreement constitutes the entire agreement and understanding between you and us and governs your use of
          the Services. This Agreement supersedes any prior or contemporaneous agreements, communications, and
          proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of
          the Terms).
        </p>
        <p className="text-start">
          Any ambiguities in the interpretation of these Terms shall not be construed against us.
        </p>
        <p className="text-start">
          Any failure by us to exercise or enforce any right or provision of these Terms shall not constitute a waiver
          of such right or provision.
        </p>
        <h1>15. Governing Law.</h1>
        <p className="text-start">
          <blockquote className="blockquote">The law of the Republic of Estonia governs our Services.</blockquote>
        </p>
        <p className="text-start">
          These Terms and any separate agreements whereby we provide you Services shall be governed by and construed in
          accordance with the laws of the Republic of Estonia.
        </p>
        <h1>16. Arbitration Agreement and Waiver of Rights, Including Class Actions.</h1>
        <p className="text-start">
          PLEASE READ THIS SECTION CAREFULLY: IT MAY SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO
          FILE A LAWSUIT IN COURT AND TO HAVE A JURY HEAR YOUR CLAIMS. IT CONTAINS PROCEDURES FOR MANDATORY BINDING
          ARBITRATION AND A CLASS ACTION WAIVER.
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            Before trying to sue us, you agree to first engage in good faith negotiations with us to resolve any
            dispute.
          </blockquote>
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            We agree that if we can't sort it out through negotiations, it will be resolved through binding arbitration.
          </blockquote>
        </p>
        <p className="text-start">
          <blockquote className="blockquote">
            Unless you provide a timely arbitration opt-out notice to us to the email address provided in Contact
            Information below, you acknowledge and agree that you and we are each waiving the right to a trial by jury
            or to participate as a plaintiff or class member in any purported class action or representative proceeding.
          </blockquote>
        </p>
        <h2>Agreement to Attempt to Resolve Disputes Through Good Faith Negotiations</h2>
        <p className="text-start">
          Prior to commencing any legal proceeding against us of any kind, including an arbitration as set forth below,
          you and we agree that we will attempt to resolve any dispute, claim, or controversy between us arising out of
          or relating to the agreement or the Services (each, a "Dispute" and, collectively, "Disputes") by engaging in
          good faith negotiations. Such good faith negotiations require, at a minimum, that the aggrieved party provide
          a written notice to the other party specifying the nature and details of the Dispute. The party receiving such
          notice shall have thirty (30) days to respond to the notice. Within sixty (60) days after the aggrieved party
          sent the initial notice, the parties shall meet and confer in good faith by videoconference, or by telephone,
          to try to resolve the Dispute. If the parties are unable to resolve the Dispute within ninety (90) days after
          the aggrieved party sent the initial notice, the parties may agree to mediate their Dispute, or either party
          may submit the Dispute to arbitration as set forth below.
        </p>
        <h2>Agreement to Arbitrate</h2>
        <p className="text-start">
          You and we agree that any Dispute that cannot be resolved through the procedures set forth above will be
          resolved through binding arbitration in accordance with the International Arbitration Rules of the
          International Centre for Dispute Resolution. The place of arbitration shall be the Republic of Estonia. The
          language of the arbitration shall be English. The arbitrator(s) shall have experience adjudicating matters
          involving Internet technology, software applications, financial transactions and, ideally, blockchain
          technology. The prevailing party will be entitled to an award of their reasonable attorney's fees and costs.
          Except as may be required by law, neither a party nor its representatives may disclose the existence, content,
          or results of any arbitration hereunder without the prior written consent of (all/both) parties.
        </p>
        <p className="text-start">
          UNLESS YOU PROVIDE US WITH A TIMELY ARBITRATION OPT-OUT NOTICE TO US AT THE EMAIL INDICATED IN THE CONTACT
          INFORMATION BELOW, YOU ACKNOWLEDGE AND AGREE THAT YOU AND WE ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY OR
          TO PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS ACTION OR REPRESENTATIVE PROCEEDING.
          FURTHER, UNLESS BOTH YOU AND WE OTHERWISE AGREE IN WRITING, THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE
          PERSON'S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF ANY CLASS OR REPRESENTATIVE PROCEEDING.
        </p>
        <h2>Changes</h2>
        <p className="text-start">
          By rejecting any changes to these Terms, you agree that you will arbitrate any Dispute between you and us in
          accordance with the provisions of this section as of the date you first accepted these Terms (or accepted any
          subsequent changes to these Terms).
        </p>
      </ArticleLayout>
    </div>
  );
}
