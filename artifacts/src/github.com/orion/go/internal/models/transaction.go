package models

type CertificateTransaction struct {
	Base
	CertificateID      string `json:"certificate_id"`
	OldOwnerNationalID string `json:"old_owner_national_id"`
	NewOwnerNationalID string `json:"new_owner_national_id"`
	Status             string `json:"status"`
	SecretKey          string `json:"secret_key"`
	CreatedAt          string `json:"created_at"`
}

type CertificateTransactionDetail struct {
	Base
	Detail string `json:"detail"`
}
