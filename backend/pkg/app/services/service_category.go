package services

import (
	"blank/pkg/app/models"
	"blank/pkg/app/repositories"
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
