import os
import json
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(BASE_DIR, "data", "indian_legal_corpus.json")

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

CONFIDENTIALITY_TEMPLATES = [
    "The receiving party shall keep all proprietary trade secrets and confidential information strictly confidential.",
    "No proprietary data, client lists, or technical source code shall be disclosed to any third party without prior written consent.",
    "The recipient agrees to protect all confidential disclosures using the same degree of care it uses for its own confidential assets.",
    "Confidential information shall remain the exclusive property of the disclosing party and shall be returned upon termination.",
    "Any trade secrets, proprietary algorithms, or non-public financial records disclosed under this agreement are strictly privileged.",
    "The recipient shall restrict disclosure of confidential information solely to employees with a verified need to know.",
    "All business plans, customer metrics, and technical designs shared during commercial discussions shall be treated as strictly secret.",
    "The obligations of confidentiality under this section shall survive termination of this contract for a period of five years.",
    "Proprietary technical materials, product roadmaps, and pricing models must be safeguarded against unauthorized dissemination.",
    "Confidential information does not include information that becomes publicly known without breach of this covenant."
]

FIR_TEMPLATES = [
    "FIR No. {fir_num}/{year} Police Station {ps} registered Under Section {section} following secret informer intelligence.",
    "First Information Report registered at Police Station {ps} under Section 154 Cr.P.C. alleging cognizable offences.",
    "On patrolling duty, HC Satender and ASI Narender Singh received secret information regarding arrival of accused with contraband {substance}.",
    "IO prepared Rukka and handed over seized case properties, copy of seizure memo, and original FSL Form to police station for FIR registration.",
    "After completion of investigation, charge-sheet was filed in the court for commission of offence under Section 21(b) NDPS Act.",
    "The complainant approached the police station alleging fraudulent inducement, cheating, and criminal breach of trust of Rs. {amount}.",
    "Raiding team apprehended the suspect at {spot} and recovered two polythene packets containing {weight} grams of {substance}.",
    "The recovered substance was tested using field testing kit and converted into sealed pullandas with seal NS and deposited in malkhana.",
    "FIR registered under Section 154 Cr.P.C. for cognizable criminal conspiracy and cheating causing wrongful monetary loss.",
    "Police conducted raid following secret information and registered formal criminal proceedings against the accused.",
    "The accused was apprehended and personal search was conducted vide seizure memo Ex.PW2/A recovering contraband substance.",
    "Investigating Officer prepared site plan Ex.PW10/P4 and arrested the accused vide arrest memo Ex.PW2/B.",
    "DD entry No. 29A was recorded at Police Station {ps} regarding departure of patrolling team prior to intercepting the accused.",
    "Chargesheet was submitted before the Special Judge NDPS alleging illegal possession and transport of narcotic substances.",
    "The informant reported that the named accused dishonestly induced transfer of valuable property under Section 420 IPC."
]

SUBPOENA_TEMPLATES = [
    "YOU ARE COMMANDED to produce at the time, date, and place set forth below each of the following specified documents.",
    "Subpoena duces tecum commanding records custodian of {bank} to surrender wire transfer ledgers and account statements.",
    "Failure to obey this subpoena may be deemed a contempt of court under Rule 45 of the Federal Rules of Civil Procedure.",
    "The recipient is commanded to attend and give deposition testimony under oath in the civil action pending before the district court.",
    "Subpoena served commanding production of all electronically stored information, email correspondence, and accounting books.",
    "You are commanded to appear at the deposition to testify as a witness in this action at the specified law offices.",
    "A motion to quash the subpoena was filed on the grounds of overbreadth, undue burden, and attorney-client work product privilege.",
    "The court issued a subpoena ad testificandum compelling attendance of the corporate witness for evidentiary examination.",
    "Disobedience of the subpoena directives shall subject the defaulting party to judicial sanctions and contempt of court penalties.",
    "Subpoena ordering production of books, ledgers, contracts, and financial audits by the designated discovery deadline.",
    "Commanded to produce all communications, board minutes, and audit workpapers relating to {entity} within twenty days.",
    "Under Federal Rule 45, failure to comply with this subpoena without adequate excuse constitutes contempt of the issuing court.",
    "Records custodian must tender an affidavit of authenticity verifying that the produced documents are business records.",
    "Subpoena directing witness to appear for live deposition in the Southern District of New York on the scheduled trial date.",
    "Motion for protective order filed seeking to narrow the scope of the subpoena duces tecum issued by the plaintiff."
]

SUMMONS_TEMPLATES = [
    "SUMMONS TO DEFENDANT FOR APPEARANCE under Order V Rule 1 and 5 of the Code of Civil Procedure 1908.",
    "WHEREAS the plaintiff has instituted a suit against you for recovery of dues; you are hereby summoned to appear before this court.",
    "You are hereby required to appear before this court in person or by pleader on the {day} day of {month} at 10:00 AM.",
    "Take notice that in default of your appearance on the day before mentioned, the suit will be heard and determined ex-parte.",
    "Summons to witness under Section 61 of the Code of Criminal Procedure requiring attendance to give evidence before the Magistrate.",
    "The defendant having failed to appear despite due service of court summons, the court proceeded to set the defendant ex-parte.",
    "Given under my hand and the seal of the court, you are hereby commanded to attend this court on the scheduled hearing date.",
    "Summons for settlement of issues served on the defendant requiring filing of written statement within thirty days.",
    "Mandatory judicial summons directing the respondent to enter appearance and defend against the pending recovery suit.",
    "The court issued summons directing the respondent party to personally appear or instruct an advocate before the next date.",
    "Writ of summons issued by the Civil Judge Senior Division commanding appearance in Suit No. {suit_num} of {year}.",
    "Failure to answer this court summons will result in entry of default judgment and decree against the defendant.",
    "Summons served upon the defendant through registered post and bailiff for disposal of civil commercial suit.",
    "Process server executed summons upon the defendant at residential address directing appearance before the magistrate.",
    "The court ordered fresh summons to be issued by all modes including speed post and email returnable on the next date."
]

ACQUITTAL_TEMPLATES = [
    "In light of the abovesaid findings, observations and reasoning, the prosecution has failed to prove its case on the touchstone of beyond reasonable doubt against the accused.",
    "The accused is accordingly acquitted from the charges levelled against him under Section 21(b) NDPS Act.",
    "Since the alleged recovery of heroin from accused is claimed from his person, defect in notice under Section 50 NDPS Act vitiates the entire recovery.",
    "In view of State of Rajasthan vs Parmanand, the search has to be held illegal and benefit of doubt must ensue to accused.",
    "In Mohan Lal vs State, it was held that drawing of samples at the spot without Magistrate certification does not arise under Section 52-A.",
    "In the absence of material to establish that samples of seized contraband were drawn in the presence of the Magistrate, recovery is inadmissible.",
    "Once there is no primary evidence available under Section 52-A NDPS Act, the trial as a whole stands vitiated.",
    "Neither any public witness has been joined during entire search and seizure procedure nor IO recorded particulars of any person.",
    "Failure of the police raiding party to associate independent public witnesses in a populated residential park casts grave doubt on the case.",
    "The trial court judgment of acquittal is upheld as the prosecution failed to establish foundational facts beyond reasonable doubt.",
    "Benefit of doubt must be extended to the accused where mandatory statutory search procedures under Section 50 are breached.",
    "The impugned judgment of conviction is set aside and the appellant is acquitted of all charges and directed to be set at liberty.",
    "The requirement of informing the accused of his right to be searched before the nearest Magistrate is mandatory and non-negotiable.",
    "Notice under Section 50 NDPS Act must explicitly give option of nearest Magistrate or Gazetted Officer, failing which search is illegal.",
    "Non-compliance with statutory provisions of Section 42 and 52-A NDPS Act renders the prosecution evidence untrustworthy and fatal.",
    "Where independent witnesses were available but not joined by the raiding team, serious doubt is cast upon the authenticity of recovery.",
    "The trial court rightly recorded an order of acquittal as the foundational facts of conscious possession were not established.",
    "The chemical examination report cannot cure fatal procedural violations committed during search, sampling, and seizure.",
    "The accused is acquitted of all charges and his bail bonds and surety undertakings stand discharged forthwith."
]

def build_corpus():
    old_corpus_path = OUT_PATH
    data = []
    
    if os.path.exists(old_corpus_path):
        with open(old_corpus_path, "r", encoding="utf-8") as f:
            old_data = json.load(f)
        for text, old_cls in old_data:
            if old_cls == 8:
                # Map old background class 8 to new background class 12
                data.append((text, 12))
            else:
                data.append((text, old_cls))
        print(f"Loaded {len(data)} existing samples from base corpus.")
    
    # Augment Class 1 (Confidentiality) to balance it
    conf_samples = []
    for _ in range(50):
        for t in CONFIDENTIALITY_TEMPLATES:
            conf_samples.append((t, 1))
    data.extend(conf_samples[:750])
    
    # Generate Class 8: FIR & Criminal Allegations (~1100 samples)
    fir_samples = []
    police_stations = ["Mangol Puri", "Hauz Khas", "Connaught Place", "Sultanpuri", "Rohini", "Saket", "Kotwali", "Crime Branch"]
    substances = ["Smack", "Heroin", "Charas", "Ganja", "contraband powder"]
    spots = ["Bus Stand Route No. 901", "Y Block Park near Silai Centre", "Old Delhi Railway Station Parking", "Ring Road Intercept"]
    sections = ["21(b) NDPS Act", "20(b) NDPS Act", "420/406 IPC", "302/34 IPC", "392/397 IPC"]
    
    for _ in range(75):
        for t in FIR_TEMPLATES:
            text = t.format(
                fir_num=random.randint(100, 1999),
                year=random.choice([2017, 2018, 2021, 2023, 2024]),
                ps=random.choice(police_stations),
                section=random.choice(sections),
                substance=random.choice(substances),
                amount=f"{random.randint(10, 95)},00,000",
                spot=random.choice(spots),
                weight=f"{random.uniform(5.5, 45.0):.2f}"
            )
            fir_samples.append((text, 8))
    data.extend(fir_samples[:1150])
    
    # Generate Class 9: Subpoena & Compulsory Discovery (~1100 samples)
    subpoena_samples = []
    banks = ["JPMorgan Chase Bank", "Citibank N.A.", "Bank of America", "Wells Fargo", "Goldman Sachs"]
    entities = ["Apex Global Trading LLC", "Meridian Logistics Inc", "Titan Holdings Corp", "Vanguard Capital Partners"]
    
    for _ in range(75):
        for t in SUBPOENA_TEMPLATES:
            text = t.format(
                bank=random.choice(banks),
                entity=random.choice(entities)
            )
            subpoena_samples.append((text, 9))
    data.extend(subpoena_samples[:1150])
    
    # Generate Class 10: Court Summons & Appearance (~1100 samples)
    summons_samples = []
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    for _ in range(75):
        for t in SUMMONS_TEMPLATES:
            text = t.format(
                day=random.randint(1, 28),
                month=random.choice(months),
                suit_num=random.randint(100, 9999),
                year=random.choice([2021, 2022, 2023, 2024])
            )
            summons_samples.append((text, 10))
    data.extend(summons_samples[:1150])
    
    # Generate Class 11: Trial Judgment & Acquittal Ruling (~1100 samples)
    acquittal_samples = []
    for _ in range(60):
        for t in ACQUITTAL_TEMPLATES:
            acquittal_samples.append((t, 11))
    data.extend(acquittal_samples[:1150])
    
    # Shuffle dataset
    random.shuffle(data)
    
    from collections import Counter
    counts = Counter(item[1] for item in data)
    print("\nFinal 13-Class Dataset Distribution:")
    for cls_id in range(13):
        print(f"Class {cls_id}: {counts[cls_id]} samples")
    print(f"Total dataset size: {len(data)} samples across 13 specialized legal classes.\n")
    
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Corpus successfully written to {OUT_PATH}")

if __name__ == "__main__":
    build_corpus()
