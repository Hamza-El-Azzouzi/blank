package repositories

import (
	"database/sql"
	"fmt"

	"real-time-forum/internal/models"
)

type CategoryRepository struct {
	DB *sql.DB
}

func (r *CategoryRepository) GetAllCategories() ([]models.Category, error) {
	rows, err := r.DB.Query("SELECT * FROM categories")
	if err != nil {
		return nil, fmt.Errorf("error querying categories: %v", err)
	}
	defer rows.Close()
	var categories []models.Category
	
	for rows.Next() {
		var cat models.Category
		err := rows.Scan(&cat.ID, &cat.Name)
		if err != nil {
			return nil, fmt.Errorf("error scanning category: %v", err)
		}
		categories = append(categories, cat)
	}
	
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("error iterating categories: %v", err)
	}
	return categories, nil
}
func (r *CategoryRepository) CheckCategorie(categorie string) bool{
	var num int
	query := `SELECT COUNT(*) FROM categories WHERE id = ?`
	row := r.DB.QueryRow(query, categorie)
	err := row.Scan(&num)
	if err != nil {
		return false
	}
	if num == 1 {
		return true
	}
	return false
}
