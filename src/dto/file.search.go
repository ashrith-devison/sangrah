package dto

type FileSearchParams struct {
	Filename  string   `json:"filename"`
	MimeType  string   `json:"mimeType"`
	MinSize   float64  `json:"minSize"`
	MaxSize   float64  `json:"maxSize"`
	StartDate string   `json:"startDate"`
	EndDate   string   `json:"endDate"`
	Tags      []string `json:"tags"`
	Uploader  string   `json:"uploader"`
	Limit     int      `json:"limit"`
	Offset    int      `json:"offset"`
}
