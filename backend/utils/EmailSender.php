<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailSender {
    public function sendApprovalEmail($email, $pdfPath, $bookingData) {
        $mail = new PHPMailer(true);

        try {
            // Server settings (To be configured by Hostinger SMTP)
            // $mail->isSMTP();
            // $mail->Host       = 'smtp.hostinger.com';
            // $mail->SMTPAuth   = true;
            // $mail->Username   = 'info@karurbuildexpo.com';
            // $mail->Password   = 'YOUR_PASSWORD';
            // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            // $mail->Port       = 465;

            // Using standard mail() for now as fallback
            $mail->setFrom('no-reply@karurbuildexpo.com', 'Karur Build Expo 2026');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Karur Build Expo 2026 Stall Booking Approved';
            $mail->Body    = '
                <h3>Congratulations!</h3>
                <p>Dear ' . $bookingData['contact_person'] . ',</p>
                <p>Your stall booking for Karur Build Expo 2026 has been successfully approved.</p>
                <p><strong>Booking ID:</strong> ' . $bookingData['booking_id'] . '<br>
                <strong>Hall:</strong> ' . $bookingData['hall_name'] . '<br>
                <strong>Stall No:</strong> ' . $bookingData['stall_no'] . '</p>
                <p>Please find attached your official Booking Slip.</p>
                <br>
                <p>Regards,<br>Team Karur Build Expo 2026</p>
            ';

            if(file_exists($pdfPath)) {
                $mail->addAttachment($pdfPath);
            }

            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function sendRejectionEmail($email, $bookingData) {
        $mail = new PHPMailer(true);

        try {
            $mail->setFrom('no-reply@karurbuildexpo.com', 'Karur Build Expo 2026');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Karur Build Expo 2026 Stall Booking Status';
            $mail->Body    = '
                <p>Dear ' . $bookingData['contact_person'] . ',</p>
                <p>We regret to inform you that your stall booking application for Karur Build Expo 2026 has been rejected.</p>
                <p>For more details, please contact our support team.</p>
                <br>
                <p>Regards,<br>Team Karur Build Expo 2026</p>
            ';

            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
