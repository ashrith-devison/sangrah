package admin

import (
	"backend/src/utils"
	"net/http"

	"go.uber.org/zap"
)

// AdminStatsHandler provides usage stats (download counts, etc.)
// @Summary Get usage stats
// @Description Retrieves overall usage statistics (admin only)
// @Tags admin
// @Produce json
// @Success 200 {object} dto.AdminStatsResponse
// @Security BearerAuth
// @Router /api/v1/admin/stats [get]
func AdminStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := AdminService.GetUsageStats()
	if err != nil {
		AdminLogger.Error("Failed to fetch stats", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch stats", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Stats fetched", stats)
}
