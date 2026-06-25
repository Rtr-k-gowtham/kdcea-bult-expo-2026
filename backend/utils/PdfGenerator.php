<?php
// Assume TCPDF is loaded via composer

class PdfGenerator {
    public function generateBookingSlip($bookingData) {
        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // set document information
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('Karur Build Expo 2026');
        $pdf->SetTitle('Booking Slip - ' . $bookingData['booking_id']);
        
        // remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // set default monospaced font
        $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

        // set margins
        $pdf->SetMargins(15, 15, 15);

        // set auto page breaks
        $pdf->SetAutoPageBreak(TRUE, 15);

        // add a page
        $pdf->AddPage();

        // Title
        $pdf->SetFont('helvetica', 'B', 20);
        $pdf->SetTextColor(0, 51, 153); // Blue
        $pdf->Cell(0, 15, 'KARUR BUILD EXPO 2026', 0, 1, 'C');
        
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(204, 153, 0); // Gold
        $pdf->Cell(0, 10, 'STALL BOOKING SLIP', 0, 1, 'C');

        $pdf->Ln(10);

        // Booking Info
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('helvetica', '', 12);
        
        $html = '
        <table border="1" cellpadding="5">
            <tr><td width="30%"><strong>Booking ID</strong></td><td width="70%">' . $bookingData['booking_id'] . '</td></tr>
            <tr><td><strong>Company Name</strong></td><td>' . $bookingData['company_name'] . '</td></tr>
            <tr><td><strong>Contact Person</strong></td><td>' . $bookingData['contact_person'] . '</td></tr>
            <tr><td><strong>Mobile Number</strong></td><td>' . $bookingData['mobile'] . '</td></tr>
            <tr><td><strong>Email</strong></td><td>' . $bookingData['email'] . '</td></tr>
            <tr><td><strong>Hall</strong></td><td>' . $bookingData['hall_name'] . '</td></tr>
            <tr><td><strong>Stall Number</strong></td><td>' . $bookingData['stall_no'] . '</td></tr>
            <tr><td><strong>Category</strong></td><td>' . $bookingData['category_name'] . '</td></tr>
            <tr><td><strong>Approval Date</strong></td><td>' . date('Y-m-d H:i:s') . '</td></tr>
        </table>
        <br><br>
        <p>Congratulations! Your stall at Karur Build Expo 2026 has been successfully booked.</p>
        <p>Please present this slip at the venue for registration.</p>
        ';

        $pdf->writeHTML($html, true, false, true, false, '');

        $fileName = 'slip_' . $bookingData['booking_id'] . '.pdf';
        $pdfDir = __DIR__ . '/../uploads/pdfs/';
        if (!is_dir($pdfDir)) {
            mkdir($pdfDir, 0755, true);
        }
        $filePath = $pdfDir . $fileName;

        $pdf->Output($filePath, 'F');
        return $filePath;
    }
}
