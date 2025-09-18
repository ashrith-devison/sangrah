package controllers

import (
	"backend/src/dto"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"net/http"
	"strconv"

	"go.uber.org/zap"
)

var fileSearchService *servicesImpl.FileSearchService

func InitFileSearchService() {
	fileSearchService = servicesImpl.NewFileSearchService()
}

// SearchFilesHandler handles file search and filtering
// @Summary Search files
// @Description Search and filter files by filename, MIME type, size, date, tags, uploader
// @Tags file-search
// @Accept json
// @Produce json
// @Param filename query string false "Filename to search"
// @Param mimeType query string false "MIME type filter"
// @Param minSize query number false "Minimum file size"
// @Param maxSize query number false "Maximum file size"
// @Param startDate query string false "Start upload date"
// @Param endDate query string false "End upload date"
// @Param uploader query string false "Uploader's name"
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {object} utils.APIResponse{data=[]dto.FileMeta} "Search results"
// @Router /api/v1/file/search [get]
func SearchFilesHandler(w http.ResponseWriter, r *http.Request) {
	params := dto.FileSearchParams{
		Filename: r.URL.Query().Get("filename"),
		MimeType: r.URL.Query().Get("mimeType"),
		Uploader: r.URL.Query().Get("uploader"),
		Limit:    50, // Default limit
		Offset:   0,  // Default offset
	}
	// Parse numeric and date params
	if minSize := r.URL.Query().Get("minSize"); minSize != "" {
		if v, err := parseFloat(minSize); err == nil {
			params.MinSize = v
		}
	}
	if maxSize := r.URL.Query().Get("maxSize"); maxSize != "" {
		if v, err := parseFloat(maxSize); err == nil {
			params.MaxSize = v
		}
	}
	params.StartDate = r.URL.Query().Get("startDate")
	params.EndDate = r.URL.Query().Get("endDate")
	if limit := r.URL.Query().Get("limit"); limit != "" {
		if v, err := parseInt(limit); err == nil && v > 0 {
			params.Limit = v
		}
	}
	if offset := r.URL.Query().Get("offset"); offset != "" {
		if v, err := parseInt(offset); err == nil && v >= 0 {
			params.Offset = v
		}
	}
	results, err := fileSearchService.SearchFiles(params)
	if err != nil {
		logger.Error("File search failed", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "File search failed", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Files found successfully", results)
}

func parseFloat(s string) (float64, error) {
	return strconv.ParseFloat(s, 64)
}

func parseInt(s string) (int, error) {
	return strconv.Atoi(s)
}
