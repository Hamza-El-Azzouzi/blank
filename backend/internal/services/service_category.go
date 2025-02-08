package services

import (
	"real-time-forum/internal/models"
	"real-time-forum/internal/repositories"
)

type CategoryService struct {
	CategorieRepo *repositories.CategoryRepository
}

func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	categories, err := s.CategorieRepo.GetAllCategories()
	if err != nil {
		return nil, err
	}

	return categories, nil
}
