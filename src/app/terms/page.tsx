"use client"

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import Navigation from '@/components/navigation'
import { Music, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const { data: session } = useSession()
  
  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Header */}
        <Header />

        {/* Navigation */}
        {session && <Navigation />}

        {/* Back Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link 
            href="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Content */}
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>Terms and Conditions</h1>
          <p style={{fontSize: '1rem', color: '#cbd5e1', marginBottom: '3rem'}}>Last updated: {new Date().toLocaleDateString()}</p>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
            
            {/* Payment Terms */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Payment Terms
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Deposit Requirement:</strong> A 50% deposit is required to begin work on any project. This deposit is non-refundable once work has commenced.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Final Payment:</strong> The remaining balance is due upon project completion and before final files are delivered. Payment can be made via [payment methods will be specified when payment processing is fully implemented].
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Payment Methods:</strong> We accept payment through secure online payment processing. Accepted payment methods include credit cards, debit cards, and bank transfers. Payment processing details will be provided at the time of invoice or quote approval.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Late Payments:</strong> Invoices that are not paid by the due date may be subject to late fees. Any outstanding balances after 30 days may result in suspension of services and/or collection actions.
                </p>
              </div>
            </section>

            {/* Deliverables */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Deliverables
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>File Release:</strong> Final audio files will be delivered in the agreed format only after full payment has been received. This includes final mixes, masters, and any other deliverables specified in the project agreement.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Project Files:</strong> Project files (stems, session files, source files, etc.) are available upon request and full payment. Standard delivery includes final mixes and masters. Raw project files may be subject to additional fees.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Delivery Format:</strong> Files will be delivered in the format and specifications agreed upon at the start of the project. Standard formats include WAV, MP3, and other industry-standard formats as specified.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>File Storage:</strong> Completed project files will be retained for a period of [X] months after project completion. Requests for file re-delivery after this period may be subject to additional fees.
                </p>
              </div>
            </section>

            {/* Revisions */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Revisions
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Included Revisions:</strong> All projects include up to 3 rounds of revisions at no additional charge. Revisions must be requested within a reasonable timeframe after delivery (typically within 30 days).
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Additional Revisions:</strong> Additional revision rounds beyond the included 3 rounds will be billed at our standard hourly rate. We will provide an estimate before proceeding with additional revisions.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Revision Scope:</strong> Revisions cover reasonable changes to the delivered work. Significant changes that alter the original project scope may be treated as a new project and quoted separately.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Client Feedback:</strong> To ensure efficient revision cycles, clients are encouraged to provide consolidated feedback. Multiple piecemeal revision requests may count as separate revision rounds.
                </p>
              </div>
            </section>

            {/* Ownership & Rights */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Ownership & Rights
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Rights Transfer:</strong> All rights to the final work transfer to the client upon receipt of full payment. This includes the right to use, distribute, and modify the delivered work for commercial purposes.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Work in Progress:</strong> Prior to full payment, all work in progress remains the property of Uniquitous Music. Unpaid work may not be used, distributed, or publicly shared.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Client Materials:</strong> The client is responsible for clearing any samples, copyrighted material, or third-party content used in the project. Uniquitous Music is not responsible for copyright infringement related to client-provided materials.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Portfolio Use:</strong> Uniquitous Music reserves the right to use completed projects (with full payment received) for portfolio, marketing, and promotional purposes unless otherwise agreed in writing.
                </p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Cancellation Policy
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Client Cancellation:</strong> If a client cancels a project after work has begun, the client is responsible for payment of all work completed to date. The deposit is non-refundable once work has commenced.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Cancellation Before Work Begins:</strong> If cancellation occurs before any work has begun, the deposit may be refunded at our discretion, minus any administrative fees.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Unpaid Completed Work:</strong> If work is completed but full payment is not received, Uniquitous Music retains all rights to the work and files will not be released until payment is received.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Project Delays:</strong> Delays caused by the client (including delayed feedback, late payment, or change requests) may result in adjusted timelines and additional fees if the delay significantly impacts project scheduling.
                </p>
              </div>
            </section>

            {/* Timeline Expectations */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Timeline Expectations
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Project Timeline:</strong> Project completion timelines are estimates based on the project scope and are subject to client feedback timeliness. Timeline estimates will be provided at the project outset.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Rush Services:</strong> Rush or expedited projects may be available at additional fees. Rush service availability and fees will be discussed and agreed upon before project commencement.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Client Responsibilities:</strong> Timely client feedback is essential to meeting project deadlines. Delays in client feedback may result in extended project timelines.
                </p>
              </div>
            </section>

            {/* Additional Terms */}
            <section style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem'}}>
                Additional Terms
              </h2>
              <div style={{color: '#cbd5e1', lineHeight: '1.8'}}>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Modifications:</strong> These terms may be modified at any time. Clients will be notified of any material changes. Continued use of services after modifications constitutes acceptance of the updated terms.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Dispute Resolution:</strong> Any disputes arising from these terms or services provided will be resolved through good faith negotiation. If resolution cannot be reached, disputes will be resolved through [arbitration/mediation/legal proceedings] as appropriate.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Limitation of Liability:</strong> Uniquitous Music's liability is limited to the amount paid for the specific project in question. We are not liable for indirect, incidental, or consequential damages.
                </p>
                <p style={{marginBottom: '1rem'}}>
                  <strong style={{color: 'white'}}>Contact:</strong> For questions about these terms and conditions, please contact us at george@uniquitousmusic.com or (609) 316-8080.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

