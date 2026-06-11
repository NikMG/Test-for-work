import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ArticleList from './ArticleList';
import { AuthProvider } from './context/AuthContext';

jest.mock('./api/articles');
jest.mock('./context/AuthContext', () => ({
    ...jest.requireActual('./context/AuthContext'),
    useAuth: jest.fn(),
}));

import { articlesApi } from './api/articles';
import { useAuth } from './context/AuthContext';

const mockArticles = [
    {
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['new'],
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-01-15T10:00:00Z',
        favorited: false,
        favoritesCount: 5,
        author: {
            username: 'testname',
            bio: 'Test bio',
            image: 'https://example.com/image.jpg',
            following: false,
        },
    },
];

const mockUser = {
    email: 'alice@example.com',
    token: 'test-token',
    username: 'alice',
    bio: 'Alice bio',
    image: 'https://example.com/alice.jpg',
};

beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn(() => null),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(() => null),
        },
        writable: true,
    });
});

describe('ArticleList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            isLoading: false,
            login: jest.fn(),
            logout: jest.fn(),
        });
    });

    test('adding article to favorite', async () => {
        (articlesApi.getAll as jest.Mock).mockResolvedValue({
            data: { articles: mockArticles, articlesCount: 1 },
        });

        const favoritedArticle = {
            ...mockArticles[0],
            favorited: true,
            favoritesCount: 6,
        };
        (articlesApi.favorite as jest.Mock).mockResolvedValue({
            data: { article: favoritedArticle },
        });

        render(
            <BrowserRouter>
                <AuthProvider>
                    <ArticleList />
                </AuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Article')).toBeInTheDocument();
        });

        const favoriteButton = screen.getByText('5');
        expect(favoriteButton).toBeInTheDocument();

        userEvent.click(favoriteButton);

        expect(articlesApi.favorite).toHaveBeenCalledWith('test-article');

        await waitFor(() => {
            expect(screen.getByText('6')).toBeInTheDocument();
        });
    });
});